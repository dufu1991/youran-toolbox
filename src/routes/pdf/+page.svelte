<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { toast } from '$lib/components/ui/toast';
	import { ChevronLeft, Upload, Download, Trash2, FileText, Merge, Split, Play } from 'lucide-svelte';
	import { PDFDocument } from 'pdf-lib';

	type Mode = 'merge' | 'split';

	interface PdfFile {
		id: string;
		file: File;
		name: string;
		pageCount: number;
		pdfDoc: PDFDocument | null;
	}

	let mode: Mode = $state('merge');
	let pdfFiles: PdfFile[] = $state([]);
	let processing: boolean = $state(false);

	// 拆分设置
	let splitFile: PdfFile | null = $state(null);
	let splitMode: 'all' | 'range' | 'each' = $state('all');
	let splitRange: string = $state('');

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (files) {
			await addFiles(Array.from(files));
		}
		input.value = '';
	}

	async function addFiles(files: File[]) {
		const pdfFilesArr = files.filter(f => f.type === 'application/pdf');
		if (pdfFilesArr.length === 0) {
			toast.warning($_('pdf.noValidPdf'));
			return;
		}
		for (const file of pdfFilesArr) {
			const arrayBuffer = await file.arrayBuffer();
			const pdfDoc = await PDFDocument.load(arrayBuffer);
			const id = crypto.randomUUID();
			const newFile: PdfFile = {
				id,
				file,
				name: file.name,
				pageCount: pdfDoc.getPageCount(),
				pdfDoc
			};
			if (mode === 'merge') {
				pdfFiles = [...pdfFiles, newFile];
			} else {
				splitFile = newFile;
			}
		}
	}

	function removeFile(id: string) {
		pdfFiles = pdfFiles.filter(f => f.id !== id);
	}

	function clearAll() {
		pdfFiles = [];
		splitFile = null;
	}

	function moveUp(index: number) {
		if (index === 0) return;
		const newFiles = [...pdfFiles];
		[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
		pdfFiles = newFiles;
	}

	function moveDown(index: number) {
		if (index === pdfFiles.length - 1) return;
		const newFiles = [...pdfFiles];
		[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
		pdfFiles = newFiles;
	}

	async function mergePdfs() {
		if (pdfFiles.length < 2) return;
		processing = true;
		try {
			const mergedPdf = await PDFDocument.create();
			for (const pdfFile of pdfFiles) {
				if (pdfFile.pdfDoc) {
					const pages = await mergedPdf.copyPages(pdfFile.pdfDoc, pdfFile.pdfDoc.getPageIndices());
					pages.forEach(page => mergedPdf.addPage(page));
				}
			}
			const pdfBytes = await mergedPdf.save();
			downloadPdf(pdfBytes, 'merged.pdf');
			toast.success($_('pdf.mergeSuccess', { values: { count: pdfFiles.length } }));
		} catch (e) {
			toast.error($_('pdf.mergeFailed'));
		}
		processing = false;
	}

	async function splitPdf() {
		if (!splitFile?.pdfDoc) return;
		processing = true;
		try {
			const doc = splitFile.pdfDoc;
			const totalPages = doc.getPageCount();
			let fileCount = 0;

			if (splitMode === 'each') {
				for (let i = 0; i < totalPages; i++) {
					const newPdf = await PDFDocument.create();
					const [page] = await newPdf.copyPages(doc, [i]);
					newPdf.addPage(page);
					const pdfBytes = await newPdf.save();
					downloadPdf(pdfBytes, `page_${i + 1}.pdf`);
					fileCount++;
					await new Promise(r => setTimeout(r, 100));
				}
			} else if (splitMode === 'range') {
				const ranges = parseRanges(splitRange, totalPages);
				if (ranges.length === 0) {
					toast.warning($_('pdf.invalidRange'));
					processing = false;
					return;
				}
				for (let ri = 0; ri < ranges.length; ri++) {
					const range = ranges[ri];
					const newPdf = await PDFDocument.create();
					const pages = await newPdf.copyPages(doc, range.map(p => p - 1));
					pages.forEach(page => newPdf.addPage(page));
					const pdfBytes = await newPdf.save();
					downloadPdf(pdfBytes, `pages_${range[0]}-${range[range.length - 1]}.pdf`);
					fileCount++;
					await new Promise(r => setTimeout(r, 100));
				}
			} else {
				const newPdf = await PDFDocument.create();
				const pages = await newPdf.copyPages(doc, doc.getPageIndices());
				pages.forEach(page => newPdf.addPage(page));
				const pdfBytes = await newPdf.save();
				downloadPdf(pdfBytes, 'extracted.pdf');
				fileCount = 1;
			}
			toast.success($_('pdf.splitSuccess', { values: { count: fileCount } }));
		} catch (e) {
			toast.error($_('pdf.splitFailed'));
		}
		processing = false;
	}

	function parseRanges(rangeStr: string, max: number): number[][] {
		const ranges: number[][] = [];
		const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
		for (const part of parts) {
			if (part.includes('-')) {
				const [start, end] = part.split('-').map(s => parseInt(s.trim()));
				if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= max && start <= end) {
					const range: number[] = [];
					for (let i = start; i <= end; i++) range.push(i);
					ranges.push(range);
				}
			} else {
				const page = parseInt(part);
				if (!isNaN(page) && page >= 1 && page <= max) {
					ranges.push([page]);
				}
			}
		}
		return ranges;
	}

	function downloadPdf(bytes: Uint8Array, filename: string) {
		const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
	<div class="container mx-auto px-6 py-8">
		<header class="mb-8">
			<a href="/" class="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
				<ChevronLeft class="w-4 h-4" />
				{$_('nav.backHome')}
			</a>
			<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{$_('features.pdf.title')}</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">{$_('features.pdf.desc')}</p>
		</header>

		<!-- 模式切换 -->
		<div class="flex gap-2 mb-6">
			<Button variant={mode === 'merge' ? 'default' : 'outline'} onclick={() => { mode = 'merge'; clearAll(); }}>
				<Merge class="w-4 h-4 mr-2" />
				{$_('pdf.merge')}
			</Button>
			<Button variant={mode === 'split' ? 'default' : 'outline'} onclick={() => { mode = 'split'; clearAll(); }}>
				<Split class="w-4 h-4 mr-2" />
				{$_('pdf.split')}
			</Button>
		</div>

		{#if mode === 'merge'}
			<!-- 合并模式 -->
			{#if pdfFiles.length === 0}
				<Card.Root>
					<Card.Content class="p-0">
						<div
							class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-primary/50"
							role="button"
							tabindex="0"
							onclick={() => document.getElementById('pdf-input')?.click()}
							onkeydown={(e) => e.key === 'Enter' && document.getElementById('pdf-input')?.click()}
						>
							<FileText class="w-12 h-12 text-slate-400 mx-auto mb-4" />
							<p class="text-slate-600 dark:text-slate-300 mb-4">{$_('pdf.uploadHint')}</p>
							<Button variant="outline">{$_('pdf.selectFiles')}</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root class="mb-4">
					<Card.Header class="pb-2">
						<div class="flex items-center justify-between">
							<Card.Title class="text-base">{$_('pdf.fileList')} ({pdfFiles.length})</Card.Title>
							<div class="flex gap-2">
								<Button variant="outline" size="sm" onclick={() => document.getElementById('pdf-input')?.click()}>
									<Upload class="w-4 h-4 mr-1" />
									{$_('pdf.addMore')}
								</Button>
								<Button variant="outline" size="sm" onclick={clearAll}>
									<Trash2 class="w-4 h-4 mr-1" />
									{$_('pdf.clearAll')}
								</Button>
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<p class="text-xs text-slate-400 mb-3">{$_('pdf.dragToSort')}</p>
						<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
							{#each pdfFiles as pdfFile, i}
								<div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
									<span class="text-sm font-medium text-slate-400 w-6">{i + 1}</span>
									<FileText class="w-5 h-5 text-red-500" />
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium truncate">{pdfFile.name}</p>
										<p class="text-xs text-slate-500">{pdfFile.pageCount} {$_('pdf.pages')}</p>
									</div>
									<div class="flex items-center gap-1">
										<button class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onclick={() => moveUp(i)} disabled={i === 0}>↑</button>
										<button class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" onclick={() => moveDown(i)} disabled={i === pdfFiles.length - 1}>↓</button>
										<button class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500" onclick={() => removeFile(pdfFile.id)}>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<div class="flex justify-center">
					<Button onclick={mergePdfs} disabled={processing || pdfFiles.length < 2}>
						{#if processing}
							<span class="animate-spin mr-2">⏳</span>
							{$_('pdf.processing')}
						{:else}
							<Play class="w-5 h-5 mr-2" />
							{$_('pdf.startMerge')}
						{/if}
					</Button>
				</div>
			{/if}
		{:else}
			<!-- 拆分模式 -->
			{#if !splitFile}
				<Card.Root>
					<Card.Content class="p-0">
						<div
							class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-primary/50"
							role="button"
							tabindex="0"
							onclick={() => document.getElementById('pdf-input')?.click()}
							onkeydown={(e) => e.key === 'Enter' && document.getElementById('pdf-input')?.click()}
						>
							<FileText class="w-12 h-12 text-slate-400 mx-auto mb-4" />
							<p class="text-slate-600 dark:text-slate-300 mb-4">{$_('pdf.uploadSplitHint')}</p>
							<Button variant="outline">{$_('pdf.selectFile')}</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root class="mb-4">
					<Card.Header class="pb-2">
						<div class="flex items-center justify-between">
							<Card.Title class="text-base">{splitFile.name}</Card.Title>
							<Button variant="outline" size="sm" onclick={clearAll}>
								<Trash2 class="w-4 h-4 mr-1" />
								{$_('pdf.reselect')}
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-slate-500 mb-4">{$_('pdf.totalPages')}: {splitFile.pageCount}</p>
						<div class="space-y-3">
							<div class="flex items-center gap-2">
								<span class="text-sm text-slate-500">{$_('pdf.splitMode')}</span>
								<div class="flex">
									<button
										class="px-2 py-1 text-xs border transition-all rounded-l-sm {splitMode === 'each' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										onclick={() => splitMode = 'each'}
									>{$_('pdf.splitEach')}</button>
									<button
										class="px-2 py-1 text-xs border transition-all -ml-px rounded-r-sm {splitMode === 'range' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										onclick={() => splitMode = 'range'}
									>{$_('pdf.splitRange')}</button>
								</div>
							</div>
							{#if splitMode === 'range'}
								<div class="flex items-center gap-2">
									<input
										type="text"
										class="flex-1 px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
										placeholder={$_('pdf.rangePlaceholder')}
										bind:value={splitRange}
									/>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<div class="flex justify-center">
					<Button onclick={splitPdf} disabled={processing}>
						{#if processing}
							<span class="animate-spin mr-2">⏳</span>
							{$_('pdf.processing')}
						{:else}
							<Play class="w-5 h-5 mr-2" />
							{$_('pdf.startSplit')}
						{/if}
					</Button>
				</div>
			{/if}
		{/if}

		<input
			type="file"
			accept="application/pdf"
			multiple={mode === 'merge'}
			class="hidden"
			id="pdf-input"
			onchange={handleFileSelect}
		/>
	</div>
</div>
