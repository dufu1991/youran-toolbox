<script lang="ts">
	import { _ } from 'svelte-i18n';
	import * as XLSX from 'xlsx';
	import { save } from '@tauri-apps/plugin-dialog';
	import { writeFile } from '@tauri-apps/plugin-fs';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { ChevronLeft, X, FileSpreadsheet, FolderUp, CheckCircle, Loader2 } from 'lucide-svelte';

	let file: File | null = $state(null);
	let columns: string[] = $state([]);
	let selectedColumn = $state('');
	let headerRows = $state(1);
	let workbook: XLSX.WorkBook | null = $state(null);
	let sheetData: any[][] = $state([]);
	let processing = $state(false);
	let result: { name: string; count: number }[] = $state([]);
	let error = $state('');
	let totalDataCount = $state(0);
	let skippedCount = $state(0);
	let fileInput: HTMLInputElement;

	function openFileDialog() {
		fileInput?.click();
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		file = input.files[0];
		error = '';
		result = [];
		selectedColumn = '';
		readFile();
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (!event.dataTransfer?.files.length) return;

		file = event.dataTransfer.files[0];
		error = '';
		result = [];
		selectedColumn = '';
		readFile();
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	async function readFile() {
		if (!file) return;

		try {
			const buffer = await file.arrayBuffer();
			workbook = XLSX.read(buffer, { type: 'array' });

			const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
			sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

			if (sheetData.length > 0) {
				columns = sheetData[0]
					.map((col: any, index: number) => ({
						value: String(col || `列 ${index + 1}`),
						index
					}))
					.filter((col) => col.value.trim() !== '')
					.map((col) => col.value);
				if (columns.length > 0) {
					selectedColumn = columns[0];
				}
			}
		} catch (e) {
			error = '读取文件失败，请确保文件格式正确';
			console.error(e);
		}
	}

	function selectColumn(col: string) {
		selectedColumn = col;
	}

	async function processFile() {
		if (!workbook || !selectedColumn || sheetData.length < headerRows + 1) {
			error = '请先选择文件和分类列';
			return;
		}

		processing = true;
		error = '';
		result = [];
		totalDataCount = 0;
		skippedCount = 0;

		try {
			const colIndex = columns.indexOf(selectedColumn);
			if (colIndex === -1) {
				error = '未找到选择的列';
				processing = false;
				return;
			}

			const actualColIndex = sheetData[0].findIndex(
				(col: any) => String(col || '') === selectedColumn
			);

			const groups: Map<string, any[][]> = new Map();
			// 保留多行表头
			const headerRowsData = sheetData.slice(0, headerRows);

			// 总数据条数（不含表头）
			totalDataCount = sheetData.length - headerRows;

			// 从表头之后开始遍历数据
			for (let i = headerRows; i < sheetData.length; i++) {
				const row = sheetData[i];
				const key = row[actualColIndex];

				// 跳过空值行
				if (key === undefined || key === null || key === '') {
					skippedCount++;
					continue;
				}

				const keyStr = String(key);
				if (!groups.has(keyStr)) {
					groups.set(keyStr, []);
				}
				groups.get(keyStr)!.push(row);
			}

			const newWorkbook = XLSX.utils.book_new();

			// 保留原始数据，命名为"全部"
			const originalSheet = workbook!.Sheets[workbook!.SheetNames[0]];
			XLSX.utils.book_append_sheet(newWorkbook, originalSheet, '全部');

			// 获取原始表头区域的合并单元格信息
			const originalMerges = originalSheet['!merges'] || [];
			const headerMerges = originalMerges.filter(
				(merge: XLSX.Range) => merge.s.r < headerRows && merge.e.r < headerRows
			);

			// 获取原始表头区域的列宽
			const originalCols = originalSheet['!cols'] || [];

			// 添加分类后的 Sheet
			groups.forEach((rows, name) => {
				const sheetName = sanitizeSheetName(name);
				// 表头 + 数据
				const sheetDataWithHeader = [...headerRowsData, ...rows];
				const newSheet = XLSX.utils.aoa_to_sheet(sheetDataWithHeader);

				// 复制表头的合并单元格
				if (headerMerges.length > 0) {
					newSheet['!merges'] = headerMerges.map((merge: XLSX.Range) => ({
						s: { r: merge.s.r, c: merge.s.c },
						e: { r: merge.e.r, c: merge.e.c }
					}));
				}

				// 复制列宽
				if (originalCols.length > 0) {
					newSheet['!cols'] = [...originalCols];
				}

				XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
				result.push({ name: sheetName, count: rows.length });
			});

			const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });

			const originalName = file!.name.replace(/\.[^/.]+$/, '');
			const defaultFileName = `${originalName}_按${selectedColumn}分类.xlsx`;

			const filePath = await save({
				defaultPath: defaultFileName,
				filters: [{ name: 'Excel', extensions: ['xlsx'] }]
			});

			if (filePath) {
				await writeFile(filePath, new Uint8Array(wbout));
				result.sort((a, b) => b.count - a.count);
			} else {
				result = [];
			}
		} catch (e) {
			error = '处理文件时出错';
			console.error(e);
		} finally {
			processing = false;
		}
	}

	function sanitizeSheetName(name: string): string {
		let sanitized = name.replace(/[\\/*?[\]:]/g, '');
		if (sanitized.length > 31) {
			sanitized = sanitized.substring(0, 31);
		}
		if (!sanitized) {
			sanitized = '未命名';
		}
		return sanitized;
	}

	function reset() {
		file = null;
		columns = [];
		selectedColumn = '';
		workbook = null;
		sheetData = [];
		result = [];
		error = '';
		totalDataCount = 0;
		skippedCount = 0;
	}

	const classifiedCount = $derived(result.reduce((sum, item) => sum + item.count, 0));
	const isCountMatch = $derived(classifiedCount + skippedCount === totalDataCount);
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
	<div class="container mx-auto max-w-2xl px-6 py-8">
		<header class="mb-8">
			<a href="/" class="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
				<ChevronLeft class="w-4 h-4" />
				{$_('nav.backHome')}
			</a>
			<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{$_('features.classify.title')}</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">{$_('features.classify.desc')}</p>
		</header>

		{#if !file}
			<Card.Root>
				<Card.Content class="p-0">
					<div
						class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
						role="button"
						tabindex="0"
						ondrop={handleDrop}
						ondragover={handleDragOver}
					>
						<FolderUp class="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
						<p class="text-slate-600 dark:text-slate-300 mb-2">{$_('classify.dropHint')}</p>
						<p class="text-slate-400 dark:text-slate-500 text-sm mb-4">{$_('classify.or')}</p>
						<Button variant="outline" onclick={openFileDialog}>
							{$_('classify.selectFile')}
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept=".xlsx,.xls"
							onchange={handleFileSelect}
							class="hidden"
						/>
						<p class="text-xs text-slate-400 dark:text-slate-500 mt-4">{$_('classify.supportFormat')}</p>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root class="mb-6">
				<Card.Header class="pb-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<FileSpreadsheet class="w-8 h-8 text-green-600" />
							<div>
								<Card.Title class="text-base">{file.name}</Card.Title>
								<Card.Description>{(file.size / 1024).toFixed(1)} KB</Card.Description>
							</div>
						</div>
						<Button variant="ghost" size="icon" onclick={reset}>
							<X class="w-5 h-5" />
						</Button>
					</div>
				</Card.Header>

				{#if columns.length > 0}
					<Card.Content class="pt-0">
						<div class="border-t dark:border-slate-700 pt-4 space-y-4">
							<div>
								<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{$_('classify.selectColumn')}</p>
								<RadioGroup.Root bind:value={selectedColumn} class="gap-x-4 gap-y-2">
									{#each columns as col}
										<RadioGroup.Item value={col}>{col}</RadioGroup.Item>
									{/each}
								</RadioGroup.Root>
							</div>

							<div>
								<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{$_('classify.headerRows')}</p>
								<div class="inline-flex rounded-md shadow-sm">
									{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as num}
										<button
											class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 transition-colors first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 {headerRows === num
												? 'bg-primary text-primary-foreground border-primary z-10'
												: 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}"
											onclick={() => (headerRows = num)}
										>
											{num}
										</button>
									{/each}
								</div>
								<p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{$_('classify.headerRowsHint')}</p>
							</div>
						</div>
					</Card.Content>

					<Card.Footer class="border-t dark:border-slate-700 pt-4">
						<Button
							class="w-full"
							disabled={!selectedColumn || processing}
							onclick={processFile}
						>
							{#if processing}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								{$_('classify.processing')}
							{:else}
								{$_('classify.startClassify')}
							{/if}
						</Button>
					</Card.Footer>
				{/if}
			</Card.Root>

			{#if error}
				<div class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
					{error}
				</div>
			{/if}

			{#if result.length > 0}
				<Card.Root class="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
					<Card.Header class="pb-3">
						<Card.Title class="text-green-700 dark:text-green-400 text-base flex items-center gap-2">
							<CheckCircle class="w-5 h-5" />
							{$_('classify.done')}
						</Card.Title>
						<Card.Description class="text-green-600 dark:text-green-500">
							{$_('classify.fileSaved')}
						</Card.Description>
					</Card.Header>
					<Card.Content class="pt-0 space-y-3">
						<div class="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-slate-600 dark:text-slate-400">{$_('classify.totalData')}</span>
								<span class="font-medium text-slate-800 dark:text-slate-200">{totalDataCount} {$_('classify.items')}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-slate-600 dark:text-slate-400">{$_('classify.classified')}</span>
								<span class="font-medium text-slate-800 dark:text-slate-200">{classifiedCount} {$_('classify.items')}</span>
							</div>
							{#if skippedCount > 0}
								<div class="flex justify-between text-sm">
									<span class="text-slate-600 dark:text-slate-400">{$_('classify.skipped')}</span>
									<span class="font-medium text-amber-600 dark:text-amber-500">{skippedCount} {$_('classify.items')}</span>
								</div>
							{/if}
							<div class="flex justify-between text-sm border-t dark:border-slate-700 pt-2">
								<span class="text-slate-600 dark:text-slate-400">{$_('classify.verify')}</span>
								{#if isCountMatch}
									<span class="font-medium text-green-600 dark:text-green-500">{$_('classify.match')}</span>
								{:else}
									<span class="font-medium text-red-600 dark:text-red-500">{$_('classify.mismatch')}</span>
								{/if}
							</div>
						</div>

						<div>
							<p class="text-sm font-medium text-green-700 dark:text-green-400 mb-2">{$_('classify.detail')}（{result.length} {$_('classify.categories')}）：</p>
							<div class="max-h-48 overflow-y-auto space-y-1">
								{#each result as item}
									<div class="flex justify-between items-center py-2 px-3 bg-white/60 dark:bg-slate-800/60 rounded text-sm">
										<span class="text-slate-700 dark:text-slate-300">{item.name}</span>
										<span class="text-slate-500 dark:text-slate-400">{item.count} {$_('classify.items')}</span>
									</div>
								{/each}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		{/if}
	</div>
</div>
