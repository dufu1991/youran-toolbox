<script lang="ts">
	import * as XLSX from 'xlsx';
	import JSZip from 'jszip';
	import { open, save, message } from '@tauri-apps/plugin-dialog';
	import { writeFile, readFile } from '@tauri-apps/plugin-fs';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import {
		ChevronLeft,
		FileSpreadsheet,
		FolderUp,
		CheckCircle,
		Loader2,
		Trash2,
		Settings2,
		List,
		FolderOutput,
		FileArchive
	} from 'lucide-svelte';

	interface FileItem {
		path: string;
		name: string;
		size: number;
		columns: string[];
		selectedColumn: string;
		headerRows: number;
		workbook: XLSX.WorkBook | null;
		sheetData: any[][];
		status: 'pending' | 'processing' | 'done' | 'error';
		result: { name: string; count: number }[];
		error: string;
		totalCount: number;
		classifiedCount: number;
		skippedCount: number;
	}

	let files: FileItem[] = $state([]);
	let processing = $state(false);
	let prefix = $state('');
	let suffix = $state('_分类');
	let outputDir = $state('');

	let unifiedMode = $state(true);
	let unifiedColumn = $state('');
	let unifiedHeaderRows = $state(1);
	let outputMode = $state<'folder' | 'zip'>('folder');

	const commonColumns = $derived(() => {
		if (files.length === 0) return [];
		if (files.length === 1) return files[0].columns;
		let common = [...files[0].columns];
		for (let i = 1; i < files.length; i++) {
			common = common.filter((col) => files[i].columns.includes(col));
		}
		return common;
	});

	$effect(() => {
		if (unifiedMode && unifiedColumn) {
			files.forEach((file, index) => {
				if (file.columns.includes(unifiedColumn)) {
					files[index].selectedColumn = unifiedColumn;
				}
			});
		}
	});

	$effect(() => {
		const cols = commonColumns();
		if (unifiedMode && !unifiedColumn && cols.length > 0) {
			unifiedColumn = cols[0];
		}
	});

	$effect(() => {
		if (unifiedMode) {
			files.forEach((_, index) => {
				files[index].headerRows = unifiedHeaderRows;
			});
		}
	});

	async function openFileDialog() {
		const selected = await open({
			multiple: true,
			filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }]
		});
		if (selected && Array.isArray(selected)) {
			for (const path of selected) {
				if (!files.some((f) => f.path === path)) {
					await addFile(path);
				}
			}
		}
	}

	async function addFile(path: string) {
		const name = path.split('/').pop() || path.split('\\').pop() || path;
		const fileItem: FileItem = {
			path,
			name,
			size: 0,
			columns: [],
			selectedColumn: unifiedMode ? unifiedColumn : '',
			headerRows: unifiedMode ? unifiedHeaderRows : 1,
			workbook: null,
			sheetData: [],
			status: 'pending',
			result: [],
			error: '',
			totalCount: 0,
			classifiedCount: 0,
			skippedCount: 0
		};

		try {
			const buffer = await readFile(path);
			fileItem.size = buffer.length;
			fileItem.workbook = XLSX.read(buffer, { type: 'array' });
			const firstSheet = fileItem.workbook.Sheets[fileItem.workbook.SheetNames[0]];
			fileItem.sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
			if (fileItem.sheetData.length > 0) {
				fileItem.columns = fileItem.sheetData[0]
					.map((col: any, index: number) => ({
						value: String(col || `列 ${index + 1}`),
						index
					}))
					.filter((col) => col.value.trim() !== '')
					.map((col) => col.value);
			}
		} catch (e) {
			fileItem.error = '读取文件失败';
			console.error(e);
		}
		files = [...files, fileItem];
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	function selectColumn(fileIndex: number, col: string) {
		files[fileIndex].selectedColumn = col;
	}

	function setHeaderRows(fileIndex: number, rows: number) {
		files[fileIndex].headerRows = rows;
	}

	async function selectOutputDir() {
		const selected = await open({ directory: true, multiple: false });
		if (selected && typeof selected === 'string') {
			outputDir = selected;
		}
	}

	function sanitizeSheetName(name: string): string {
		let sanitized = name.replace(/[\\/*?[\]:]/g, '');
		if (sanitized.length > 31) sanitized = sanitized.substring(0, 31);
		if (!sanitized) sanitized = '未命名';
		return sanitized;
	}

	async function processAllFiles() {
		processing = true;
		const zip = outputMode === 'zip' ? new JSZip() : null;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const col = unifiedMode ? unifiedColumn : file.selectedColumn;
			const hRows = unifiedMode ? unifiedHeaderRows : file.headerRows;

			if (!file.workbook || !col) continue;

			files[i].status = 'processing';
			files[i].error = '';
			files[i].result = [];
			files[i].totalCount = 0;
			files[i].classifiedCount = 0;
			files[i].skippedCount = 0;

			try {
				const actualColIndex = file.sheetData[0].findIndex(
					(c: any) => String(c || '') === col
				);
				if (actualColIndex === -1) {
					files[i].error = '未找到选择的列';
					files[i].status = 'error';
					continue;
				}

				const groups: Map<string, any[][]> = new Map();
				const headerRowsData = file.sheetData.slice(0, hRows);

				// 计算总数据条数
				files[i].totalCount = file.sheetData.length - hRows;
				let skipped = 0;

				for (let j = hRows; j < file.sheetData.length; j++) {
					const row = file.sheetData[j];
					const key = row[actualColIndex];
					if (key === undefined || key === null || key === '') {
						skipped++;
						continue;
					}
					const keyStr = String(key);
					if (!groups.has(keyStr)) groups.set(keyStr, []);
					groups.get(keyStr)!.push(row);
				}

				files[i].skippedCount = skipped;

				const newWorkbook = XLSX.utils.book_new();
				const originalSheet = file.workbook.Sheets[file.workbook.SheetNames[0]];
				XLSX.utils.book_append_sheet(newWorkbook, originalSheet, '全部');

				const originalMerges = originalSheet['!merges'] || [];
				const headerMerges = originalMerges.filter(
					(merge: XLSX.Range) => merge.s.r < hRows && merge.e.r < hRows
				);
				const originalCols = originalSheet['!cols'] || [];
				const resultItems: { name: string; count: number }[] = [];

				groups.forEach((rows, name) => {
					const sheetName = sanitizeSheetName(name);
					const sheetDataWithHeader = [...headerRowsData, ...rows];
					const newSheet = XLSX.utils.aoa_to_sheet(sheetDataWithHeader);
					if (headerMerges.length > 0) {
						newSheet['!merges'] = headerMerges.map((merge: XLSX.Range) => ({
							s: { r: merge.s.r, c: merge.s.c },
							e: { r: merge.e.r, c: merge.e.c }
						}));
					}
					if (originalCols.length > 0) newSheet['!cols'] = [...originalCols];
					XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
					resultItems.push({ name: sheetName, count: rows.length });
				});

				const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
				const originalName = file.name.replace(/\.[^/.]+$/, '');
				const outputFileName = `${prefix}${originalName}${suffix}.xlsx`;

				if (outputMode === 'zip' && zip) {
					zip.file(outputFileName, new Uint8Array(wbout));
				} else if (outputDir) {
					const outputPath = `${outputDir}/${outputFileName}`;
					await writeFile(outputPath, new Uint8Array(wbout));
				}

				files[i].result = resultItems.sort((a, b) => b.count - a.count);
				files[i].classifiedCount = resultItems.reduce((sum, item) => sum + item.count, 0);
				files[i].status = 'done';
			} catch (e) {
				files[i].error = '处理文件时出错';
				files[i].status = 'error';
				console.error(e);
			}
		}

		if (outputMode === 'zip' && zip) {
			const zipContent = await zip.generateAsync({ type: 'uint8array' });
			const zipPath = await save({
				defaultPath: `批量分类结果${suffix}.zip`,
				filters: [{ name: 'ZIP', extensions: ['zip'] }]
			});
			if (zipPath) {
				await writeFile(zipPath, zipContent);
				const successCount = files.filter((f) => f.status === 'done').length;
				await message(`处理完成！共 ${successCount} 个文件已打包为 ZIP`, { title: '成功', kind: 'info' });
			}
		} else {
			const successCount = files.filter((f) => f.status === 'done').length;
			if (successCount > 0) {
				await message(`处理完成！共 ${successCount} 个文件已保存到输出目录`, { title: '成功', kind: 'info' });
			}
		}

		processing = false;
	}

	function reset() {
		files = [];
		prefix = '';
		suffix = '_分类';
		outputDir = '';
		unifiedColumn = '';
		unifiedHeaderRows = 1;
		outputMode = 'folder';
	}

	const canProcess = $derived(
		files.length > 0 &&
			(unifiedMode
				? unifiedColumn && files.every((f) => f.columns.includes(unifiedColumn))
				: files.every((f) => f.selectedColumn)) &&
			(outputMode === 'zip' || outputDir) &&
			!processing
	);

	const doneCount = $derived(files.filter((f) => f.status === 'done').length);
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<div class="container mx-auto max-w-3xl px-6 py-8">
		<header class="mb-8">
			<a href="/" class="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
				<ChevronLeft class="w-4 h-4" />
				返回首页
			</a>
			<h1 class="text-2xl font-bold text-slate-900">批量分类归档</h1>
			<p class="text-slate-500 mt-1">批量处理多个 Excel 文件，按指定列分类到不同的 Sheet</p>
		</header>

		<Card.Root class="mb-6">
			<Card.Header class="pb-4">
				<Card.Title class="text-base">选择文件</Card.Title>
				<Card.Description>支持同时选择多个 Excel 文件</Card.Description>
			</Card.Header>
			<Card.Content class="pt-0">
				<Button variant="outline" onclick={openFileDialog}>
					<FolderUp class="w-4 h-4 mr-2" />
					添加文件
				</Button>
			</Card.Content>
		</Card.Root>

		{#if files.length > 0}
			<Card.Root class="mb-6">
				<Card.Header class="pb-4">
					<div class="flex items-center justify-between">
						<div>
							<Card.Title class="text-base">分类设置</Card.Title>
							<Card.Description>选择分类依据的列和表头行数</Card.Description>
						</div>
						<div class="flex rounded-md shadow-sm">
							<button
								class="px-3 py-1.5 text-xs border border-slate-200 rounded-l-md transition-colors flex items-center gap-1.5 {unifiedMode
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-white text-slate-600 hover:bg-slate-50'}"
								onclick={() => (unifiedMode = true)}
								disabled={processing}
							>
								<Settings2 class="w-3.5 h-3.5" />
								统一设置
							</button>
							<button
								class="px-3 py-1.5 text-xs border border-slate-200 rounded-r-md -ml-px transition-colors flex items-center gap-1.5 {!unifiedMode
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-white text-slate-600 hover:bg-slate-50'}"
								onclick={() => (unifiedMode = false)}
								disabled={processing}
							>
								<List class="w-3.5 h-3.5" />
								单独设置
							</button>
						</div>
					</div>
				</Card.Header>

				{#if unifiedMode}
					<Card.Content class="pt-0 space-y-4">
						{#if commonColumns().length > 0}
							<div>
								<p class="text-sm font-medium text-slate-700 mb-2">分类列（应用到所有文件）：</p>
								<RadioGroup.Root bind:value={unifiedColumn} disabled={processing} class="gap-x-4 gap-y-2">
									{#each commonColumns() as col}
										<RadioGroup.Item value={col}>{col}</RadioGroup.Item>
									{/each}
								</RadioGroup.Root>
								{#if commonColumns().length < files[0]?.columns.length}
									<p class="text-xs text-amber-600 mt-2">仅显示所有文件共有的列</p>
								{/if}
							</div>
							<div>
								<p class="text-sm font-medium text-slate-700 mb-2">表头行数（应用到所有文件）：</p>
								<div class="inline-flex rounded-md shadow-sm">
									{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as num}
										<button
											class="px-3 py-1.5 text-sm border border-slate-200 transition-colors first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 {unifiedHeaderRows === num
												? 'bg-primary text-primary-foreground border-primary z-10'
												: 'bg-white text-slate-600 hover:bg-slate-50'}"
											onclick={() => (unifiedHeaderRows = num)}
											disabled={processing}
										>
											{num}
										</button>
									{/each}
								</div>
								<p class="text-xs text-slate-400 mt-1">分类后的 Sheet 会保留这些行作为表头</p>
							</div>
						{:else}
							<p class="text-sm text-slate-500">请先添加文件</p>
						{/if}
					</Card.Content>
				{/if}
			</Card.Root>

			<div class="space-y-4 mb-6">
				{#each files as file, index}
					<Card.Root class={file.status === 'done' ? 'border-green-200 bg-green-50/50' : file.status === 'error' ? 'border-red-200 bg-red-50/50' : ''}>
						<Card.Header class="pb-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<FileSpreadsheet class="w-6 h-6 {file.status === 'done' ? 'text-green-600' : file.status === 'error' ? 'text-red-600' : 'text-slate-400'}" />
									<div>
										<Card.Title class="text-sm">{file.name}</Card.Title>
										<Card.Description class="text-xs">{(file.size / 1024).toFixed(1)} KB</Card.Description>
									</div>
								</div>
								<Button variant="ghost" size="icon" onclick={() => removeFile(index)} disabled={processing}>
									<Trash2 class="w-4 h-4" />
								</Button>
							</div>
						</Card.Header>

						{#if file.columns.length > 0 && file.status !== 'done' && !unifiedMode}
							<Card.Content class="pt-0 space-y-3">
								<div>
									<p class="text-xs font-medium text-slate-600 mb-2">分类列：</p>
									<RadioGroup.Root value={file.selectedColumn} onValueChange={(v) => selectColumn(index, v)} disabled={processing} class="gap-x-4 gap-y-2">
										{#each file.columns as col}
											<RadioGroup.Item value={col}>{col}</RadioGroup.Item>
										{/each}
									</RadioGroup.Root>
								</div>
								<div>
									<p class="text-xs font-medium text-slate-600 mb-2">表头行数：</p>
									<div class="inline-flex rounded-md shadow-sm">
										{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as num}
											<button
												class="px-2.5 py-1 text-xs border border-slate-200 transition-colors first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 {file.headerRows === num
													? 'bg-primary text-primary-foreground border-primary z-10'
													: 'bg-white text-slate-600 hover:bg-slate-50'}"
												onclick={() => setHeaderRows(index, num)}
												disabled={processing}
											>
												{num}
											</button>
										{/each}
									</div>
								</div>
							</Card.Content>
						{/if}

						{#if unifiedMode && file.status !== 'done'}
							<Card.Content class="pt-0">
								<p class="text-xs text-slate-500">
									分类列：{unifiedColumn || '未选择'} | 表头行数：{unifiedHeaderRows}
								</p>
							</Card.Content>
						{/if}

						{#if file.status === 'processing'}
							<Card.Footer class="pt-0">
								<div class="flex items-center gap-2 text-sm text-slate-500">
									<Loader2 class="w-4 h-4 animate-spin" />
									处理中...
								</div>
							</Card.Footer>
						{/if}

						{#if file.status === 'done' && file.result.length > 0}
							<Card.Content class="pt-0">
								<div class="bg-green-50/80 rounded-lg p-3 space-y-2">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2 text-sm text-green-600 font-medium">
											<CheckCircle class="w-4 h-4" />
											完成，共 {file.result.length} 个分类
										</div>
										<div class="flex items-center gap-3 text-xs">
											<span><span class="text-slate-500">总数据</span> <span class="font-semibold text-slate-700">{file.totalCount}</span></span>
											<span class="text-slate-300">|</span>
											<span><span class="text-slate-500">已分类</span> <span class="font-semibold text-slate-700">{file.classifiedCount}</span></span>
											{#if file.skippedCount > 0}
												<span class="text-slate-300">|</span>
												<span><span class="text-slate-500">跳过</span> <span class="font-semibold text-amber-600">{file.skippedCount}</span></span>
											{/if}
											<span class="text-slate-300">|</span>
											<span class="text-slate-500">校验</span>
											{#if file.classifiedCount + file.skippedCount === file.totalCount}
												<span class="font-semibold text-green-600">一致</span>
											{:else}
												<span class="font-semibold text-red-600">不一致</span>
											{/if}
										</div>
									</div>
									<p class="text-xs text-slate-500 pt-1 border-t border-green-100">
										<span class="text-slate-600">分类明细：</span>{file.result.map(item => `${item.name}(${item.count})`).join('、')}
									</p>
								</div>
							</Card.Content>
						{/if}

						{#if file.error}
							<Card.Footer class="pt-0">
								<p class="text-sm text-red-600">{file.error}</p>
							</Card.Footer>
						{/if}
					</Card.Root>
				{/each}
			</div>

			<Card.Root class="mb-6">
				<Card.Header class="pb-4">
					<Card.Title class="text-base">输出设置</Card.Title>
				</Card.Header>
				<Card.Content class="pt-0 space-y-4">
					<div>
						<p class="text-sm font-medium text-slate-700 mb-2">输出方式：</p>
						<div class="flex rounded-md shadow-sm">
							<button
								class="px-3 py-1.5 text-sm border border-slate-200 rounded-l-md transition-colors flex items-center gap-1.5 {outputMode === 'folder'
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-white text-slate-600 hover:bg-slate-50'}"
								onclick={() => (outputMode = 'folder')}
								disabled={processing}
							>
								<FolderOutput class="w-4 h-4" />
								输出到文件夹
							</button>
							<button
								class="px-3 py-1.5 text-sm border border-slate-200 rounded-r-md -ml-px transition-colors flex items-center gap-1.5 {outputMode === 'zip'
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-white text-slate-600 hover:bg-slate-50'}"
								onclick={() => (outputMode = 'zip')}
								disabled={processing}
							>
								<FileArchive class="w-4 h-4" />
								打包为 ZIP
							</button>
						</div>
					</div>

					{#if outputMode === 'folder'}
						<div>
							<p class="text-sm font-medium text-slate-700 mb-2">输出目录：</p>
							<div class="flex gap-2">
								<Input value={outputDir} placeholder="请选择输出目录" readonly class="flex-1" />
								<Button variant="outline" onclick={selectOutputDir}>选择</Button>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm font-medium text-slate-700 mb-2">文件名前缀：</p>
							<Input bind:value={prefix} placeholder="可选" />
						</div>
						<div>
							<p class="text-sm font-medium text-slate-700 mb-2">文件名后缀：</p>
							<Input bind:value={suffix} placeholder="可选" />
						</div>
					</div>
					{#if files.length > 0}
						<p class="text-xs text-slate-400">
							示例：{prefix}{files[0].name.replace(/\.[^/.]+$/, '')}{suffix}.xlsx
						</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<div class="flex gap-3">
				<Button class="flex-1" disabled={!canProcess} onclick={processAllFiles}>
					{#if processing}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						处理中 ({doneCount}/{files.length})
					{:else}
						开始批量处理
					{/if}
				</Button>
				<Button variant="outline" onclick={reset} disabled={processing}>
					重置
				</Button>
			</div>
		{/if}
	</div>
</div>
