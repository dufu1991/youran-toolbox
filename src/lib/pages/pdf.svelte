<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { locale } from '$lib/i18n';
	import { confirm, message, open } from '@tauri-apps/plugin-dialog';
	import { exists, mkdir, readFile, stat, writeFile } from '@tauri-apps/plugin-fs';
	import { revealItemInDir } from '@tauri-apps/plugin-opener';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from '$lib/components/ui/toast';
	import { Tab } from '$lib/components/ui/tab';
	import { Upload, Trash2, FileText, Merge, Split, Play, FolderOutput, GripVertical, X } from 'lucide-svelte';
	import { PDFDocument } from 'pdf-lib';

	type Mode = 'merge' | 'split';

	interface PdfFile {
		id: string;
		file: File;
		path: string;
		name: string;
		pageCount: number;
		pdfDoc: PDFDocument | null;
	}

	let mode: Mode = $state('merge');
	let pdfFiles: PdfFile[] = $state([]);
	let processing: boolean = $state(false);
	let mergeOutputDir: string = $state('');
	let mergeLastSavedPath: string = $state('');
	let mergeFileName: string = $state('');
	let mergeFileNameCustomized: boolean = $state(false);
	let draggedPdfId: string | null = $state(null);
	let mergeDragPointerId: number | null = $state(null);
	let mergeHoverTargetId: string | null = $state(null);

	// 拆分设置
	let splitFile: PdfFile | null = $state(null);
	let splitMode: 'range' | 'each' = $state('each');
	let splitRange: string = $state('');
	let splitOutputDir: string = $state('');
	let splitProgressCurrent: number = $state(0);
	let splitProgressTotal: number = $state(0);
	let splitLastSavedDir: string = $state('');
	let splitLastSavedCount: number = $state(0);
	let splitCreateSubfolder: boolean = $state(true);
	let splitSubfolderName: string = $state('');
	let splitSubfolderExists: boolean | null = $state(null);
	let splitPreviewPage: number = $state(1);
	let splitPreviewUrl: string = $state('');
	let activeRangeGroupIndex: number | null = $state(null);
	let rangeDragAnchor: number | null = $state(null);
	let rangeDragMode: 'add' | null = $state(null);
	let rangeDragBaseRanges: number[][] = $state([]);

	const rangeGroupColorClasses = [
		{
			badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
			page: 'border-sky-500 bg-sky-500 text-white',
			connector: 'bg-sky-500'
		},
		{
			badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
			page: 'border-emerald-500 bg-emerald-500 text-white',
			connector: 'bg-emerald-500'
		},
		{
			badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
			page: 'border-amber-500 bg-amber-500 text-white',
			connector: 'bg-amber-500'
		},
		{
			badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
			page: 'border-violet-500 bg-violet-500 text-white',
			connector: 'bg-violet-500'
		},
		{
			badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
			page: 'border-rose-500 bg-rose-500 text-white',
			connector: 'bg-rose-500'
		},
		{
			badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
			page: 'border-cyan-500 bg-cyan-500 text-white',
			connector: 'bg-cyan-500'
		}
	] as const;

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
		let hasInvalidPdf = false;
		for (const file of pdfFilesArr) {
			try {
				const arrayBuffer = await file.arrayBuffer();
				const pdfDoc = await PDFDocument.load(arrayBuffer);
				const id = crypto.randomUUID();
				const newFile: PdfFile = {
					id,
					file,
					path: getFilePath(file),
					name: file.name,
					pageCount: pdfDoc.getPageCount(),
					pdfDoc
				};
				if (mode === 'merge') {
					pdfFiles = [...pdfFiles, newFile];
					if (!mergeOutputDir) {
						const defaultDir = getFileDir(file);
						if (defaultDir) {
							mergeOutputDir = defaultDir;
						}
					}
				} else {
					splitFile = newFile;
					if (!splitOutputDir) {
						const defaultDir = getFileDir(file);
						if (defaultDir) {
							splitOutputDir = defaultDir;
						}
					}
				}
			} catch {
				hasInvalidPdf = true;
			}
		}
		if (hasInvalidPdf) {
			toast.warning($_('pdf.noValidPdf'));
		}
	}

	async function openPdfDialog() {
		const selected = await open({
			multiple: mode === 'merge',
			filters: [{ name: 'PDF', extensions: ['pdf'] }]
		});
		if (!selected) {
			return;
		}

		if (Array.isArray(selected)) {
			await addFilesFromPaths(selected);
			return;
		}

		await addFilesFromPaths([selected]);
	}

	async function addFilesFromPaths(paths: string[]) {
		let hasInvalidPdf = false;

		for (const path of paths) {
			try {
				const bytes = await readFile(path);
				const pdfDoc = await PDFDocument.load(bytes);
				const id = crypto.randomUUID();
				const sep = getPathSeparator(path);
				const newFile: PdfFile = {
					id,
					file: new File([bytes], path.split(sep).pop() || path, { type: 'application/pdf' }),
					path,
					name: path.split(sep).pop() || path,
					pageCount: pdfDoc.getPageCount(),
					pdfDoc
				};
				const defaultDir = getFileDirFromPath(path);
				if (mode === 'merge') {
					pdfFiles = [...pdfFiles, newFile];
					if (!mergeOutputDir && defaultDir) {
						mergeOutputDir = defaultDir;
					}
				} else {
					splitFile = newFile;
					if (!splitOutputDir && defaultDir) {
						splitOutputDir = defaultDir;
					}
				}
			} catch {
				hasInvalidPdf = true;
			}
		}

		if (hasInvalidPdf) {
			toast.warning($_('pdf.noValidPdf'));
		}
	}

	function removeFile(id: string) {
		pdfFiles = pdfFiles.filter(f => f.id !== id);
	}

	function clearAll() {
		pdfFiles = [];
		mergeOutputDir = '';
		mergeLastSavedPath = '';
		mergeFileName = $_('pdf.defaultMergeFileName');
		mergeFileNameCustomized = false;
		draggedPdfId = null;
		mergeDragPointerId = null;
		mergeHoverTargetId = null;
		splitFile = null;
		splitMode = 'each';
		splitRange = '';
		splitOutputDir = '';
		splitProgressCurrent = 0;
		splitProgressTotal = 0;
		splitLastSavedDir = '';
		splitLastSavedCount = 0;
		splitCreateSubfolder = true;
		splitSubfolderName = '';
		splitSubfolderExists = null;
		splitPreviewPage = 1;
		splitPreviewUrl = '';
		activeRangeGroupIndex = null;
		rangeDragAnchor = null;
		rangeDragMode = null;
		rangeDragBaseRanges = [];
	}

	function getPathSeparator(path: string): string {
		if (path.includes('\\')) return '\\';
		return '/';
	}

	function getFilePath(file: File): string {
		return (file as File & { path?: string }).path || '';
	}

	function getFileDirFromPath(path: string): string {
		if (!path) {
			return '';
		}
		const sep = getPathSeparator(path);
		const lastSepIndex = path.lastIndexOf(sep);
		return lastSepIndex === -1 ? '' : path.substring(0, lastSepIndex);
	}

	function getFileDir(file: File): string {
		return getFileDirFromPath(getFilePath(file));
	}

	function getFileBaseName(name: string): string {
		return name.replace(/\.pdf$/i, '').trim();
	}

	function getSplitTargetDir(): string {
		if (!splitOutputDir) {
			return '';
		}
		if (!splitCreateSubfolder) {
			return splitOutputDir;
		}
		const trimmedName = splitSubfolderName.trim();
		if (!trimmedName) {
			return '';
		}
		const sep = getPathSeparator(splitOutputDir);
		return `${splitOutputDir}${sep}${trimmedName}`;
	}

	function setSplitPreviewPage(page: number) {
		if (!splitFile) {
			return;
		}
		splitPreviewPage = Math.min(Math.max(page, 1), splitFile.pageCount);
	}

	function formatRangeLabel(range: number[]): string {
		return range.length === 1 ? String(range[0]) : `${range[0]}-${range[range.length - 1]}`;
	}

	function selectRangeGroup(groupIndex: number | null, previewPage?: number) {
		activeRangeGroupIndex = groupIndex;
		if (previewPage) {
			setSplitPreviewPage(previewPage);
		}
	}

	function removeRangeGroup(groupIndex: number) {
		if (!splitFile || splitMode !== 'range') {
			return;
		}
		const currentState = getRangeState(splitRange, splitFile.pageCount);
		const nextRanges = currentState.ranges.filter((_, index) => index !== groupIndex);
		updateRangeFromRanges(nextRanges);
		selectRangeGroup(null);
	}

	async function selectSplitOutputDir() {
		const selected = await open({ directory: true, multiple: false });
		if (selected && typeof selected === 'string') {
			splitOutputDir = selected;
		}
	}

	async function selectMergeOutputDir() {
		const selected = await open({ directory: true, multiple: false });
		if (selected && typeof selected === 'string') {
			mergeOutputDir = selected;
		}
	}

	async function saveMergePdf(bytes: Uint8Array, filename: string) {
		if (!mergeOutputDir) {
			return;
		}
		const outputPath = await resolveMergeOutputPath(filename);
		if (!outputPath) {
			return;
		}
		await writeFile(outputPath, bytes);
		mergeLastSavedPath = outputPath;
	}

	async function savePdfToDirectory(bytes: Uint8Array, filename: string, targetDir: string) {
		if (!targetDir) {
			return;
		}
		const sep = getPathSeparator(targetDir);
		const outputPath = await resolveSplitOutputPath(targetDir, filename);
		await writeFile(outputPath, bytes);
	}

	function getErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		}
		if (typeof error === 'string') {
			return error;
		}
		return $_('pdf.unknownError');
	}

	async function openSplitOutputDir() {
		if (splitLastSavedDir) {
			await revealItemInDir(splitLastSavedDir);
		}
	}

	async function openMergeOutputDir() {
		if (mergeLastSavedPath) {
			await revealItemInDir(mergeLastSavedPath);
		}
	}

	async function pathExists(path: string): Promise<boolean> {
		try {
			return await exists(path);
		} catch {
			return false;
		}
	}

	async function resolveSplitOutputPath(targetDir: string, filename: string): Promise<string> {
		const sep = getPathSeparator(targetDir);
		const dotIndex = filename.lastIndexOf('.');
		let baseName = dotIndex === -1 ? filename : filename.slice(0, dotIndex);
		const extension = dotIndex === -1 ? '' : filename.slice(dotIndex);
		let candidatePath = `${targetDir}${sep}${baseName}${extension}`;

		while (await pathExists(candidatePath)) {
			baseName = `${baseName}-1`;
			candidatePath = `${targetDir}${sep}${baseName}${extension}`;
		}

		return candidatePath;
	}

	async function resolveMergeOutputPath(filename: string): Promise<string> {
		const sep = getPathSeparator(mergeOutputDir);
		const dotIndex = filename.lastIndexOf('.');
		const baseName = dotIndex === -1 ? filename : filename.slice(0, dotIndex);
		const extension = dotIndex === -1 ? '' : filename.slice(dotIndex);
		const targetPath = `${mergeOutputDir}${sep}${filename}`;

		if (!(await pathExists(targetPath))) {
			return targetPath;
		}

		const replaceLabel = $_('pdf.replaceFile');
		const autoRenameLabel = $_('pdf.autoRenameFile');
		const cancelLabel = $_('pdf.cancelSave');
		const action = await message($_('pdf.mergeFileExistsMessage', { values: { name: filename } }), {
			title: $_('pdf.conflictTitle'),
			kind: 'warning',
			buttons: {
				yes: replaceLabel,
				no: autoRenameLabel,
				cancel: cancelLabel
			}
		});

		if (action === replaceLabel) {
			return targetPath;
		}

		if (action === cancelLabel) {
			return '';
		}

		return `${mergeOutputDir}${sep}${baseName}_1${extension}`;
	}

	function getRangeState(rangeStr: string, max: number): {
		ranges: number[][];
		selectedPages: number[];
		selectedSet: Set<number>;
		pageGroupMap: Map<number, number>;
		valid: boolean;
	} {
		const ranges = parseRanges(rangeStr, max);
		const selectedPages = ranges.flat();
		const pageGroupMap = new Map<number, number>();
		ranges.forEach((range, index) => {
			range.forEach((page) => pageGroupMap.set(page, index));
		});
		return {
			ranges,
			selectedPages,
			selectedSet: new Set(selectedPages),
			pageGroupMap,
			valid: rangeStr.trim() === '' ? false : ranges.length > 0
		};
	}

	function pagesToRanges(pages: number[]): number[][] {
		if (pages.length === 0) {
			return [];
		}
		const sorted = [...pages].sort((a, b) => a - b);
		const ranges: number[][] = [];
		let currentRange: number[] = [sorted[0]];

		for (let i = 1; i < sorted.length; i++) {
			const page = sorted[i];
			const lastPage = currentRange[currentRange.length - 1];
			if (page === lastPage + 1) {
				currentRange.push(page);
				continue;
			}
			ranges.push(currentRange);
			currentRange = [page];
		}

		ranges.push(currentRange);
		return ranges;
	}

	function rangesToText(ranges: number[][]): string {
		return ranges
			.map((range) => range.length === 1 ? String(range[0]) : `${range[0]}-${range[range.length - 1]}`)
			.join(', ');
	}

	function buildRangeGroup(start: number, end: number): number[] {
		const range: number[] = [];
		for (let page = start; page <= end; page++) {
			range.push(page);
		}
		return range;
	}

	function subtractPreviewFromRanges(ranges: number[][], previewPages: Set<number>): number[][] {
		const nextRanges: number[][] = [];
		for (const range of ranges) {
			let current: number[] = [];
			for (const page of range) {
				if (previewPages.has(page)) {
					if (current.length > 0) {
						nextRanges.push(current);
						current = [];
					}
					continue;
				}
				current.push(page);
			}
			if (current.length > 0) {
				nextRanges.push(current);
			}
		}
		return nextRanges;
	}

	function updateRangeFromRanges(ranges: number[][]) {
		splitRange = rangesToText(ranges);
	}

	function applyRangeDrag(targetPage: number) {
		if (rangeDragAnchor === null || !rangeDragMode) {
			return;
		}
		const start = Math.min(rangeDragAnchor, targetPage);
		const end = Math.max(rangeDragAnchor, targetPage);
		const previewRange = buildRangeGroup(start, end);
		const previewPages = new Set(previewRange);
		const nextRanges = subtractPreviewFromRanges(rangeDragBaseRanges, previewPages);
		nextRanges.push(previewRange);
		updateRangeFromRanges(nextRanges);
		selectRangeGroup(nextRanges.length - 1, targetPage);
	}

	function startRangeDrag(page: number) {
		if (!splitFile || splitMode !== 'range') {
			return;
		}
		const currentState = getRangeState(splitRange, splitFile.pageCount);
		const targetGroupIndex = currentState.pageGroupMap.get(page);
		if (targetGroupIndex !== undefined) {
			const nextRanges = currentState.ranges.filter((_, index) => index !== targetGroupIndex);
			updateRangeFromRanges(nextRanges);
			selectRangeGroup(null);
			finishRangeDrag();
			return;
		}
		rangeDragAnchor = page;
		rangeDragBaseRanges = currentState.ranges;
		rangeDragMode = 'add';
		applyRangeDrag(page);
	}

	function finishRangeDrag() {
		rangeDragAnchor = null;
		rangeDragMode = null;
		rangeDragBaseRanges = [];
	}

	function handleMergeFileNameInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		mergeFileName = input.value;
		mergeFileNameCustomized = true;
	}

	$effect(() => {
		if (typeof window === 'undefined') {
			return;
		}
		const handleMouseUp = () => finishRangeDrag();
		const handlePointerUp = (event: PointerEvent) => finishMergeDrag(event.pointerId);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('pointerup', handlePointerUp);
		return () => {
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	});

	$effect(() => {
		$locale;
		const localizedDefaultName = $_('pdf.defaultMergeFileName');
		if (!mergeFileNameCustomized || !mergeFileName.trim()) {
			mergeFileName = localizedDefaultName;
			mergeFileNameCustomized = false;
		}
	});

	$effect(() => {
		const currentSplitFile = splitFile;
		if (!currentSplitFile) {
			splitCreateSubfolder = true;
			splitSubfolderName = '';
			splitSubfolderExists = null;
			splitPreviewUrl = '';
			splitPreviewPage = 1;
			activeRangeGroupIndex = null;
			return;
		}

		splitCreateSubfolder = true;
		splitSubfolderName = getFileBaseName(currentSplitFile.name);
		splitSubfolderExists = null;
		splitPreviewPage = 1;
		activeRangeGroupIndex = null;
		const objectUrl = URL.createObjectURL(currentSplitFile.file);
		splitPreviewUrl = objectUrl;

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	});

	const splitRangeState = $derived.by(() => {
		if (!splitFile || splitMode !== 'range') {
			return {
				ranges: [] as number[][],
				selectedPages: [] as number[],
				selectedSet: new Set<number>(),
				pageGroupMap: new Map<number, number>(),
				valid: false
			};
		}
		return getRangeState(splitRange, splitFile.pageCount);
	});

	const splitPageGrid = $derived.by(() => {
		if (!splitFile || splitMode !== 'range') {
			return [];
		}
		return Array.from({ length: splitFile.pageCount }, (_, index) => index + 1);
	});

	const splitPreviewFrameUrl = $derived.by(() => {
		if (!splitPreviewUrl) {
			return '';
		}
		return `${splitPreviewUrl}#page=${splitPreviewPage}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;
	});

	function isSameRangeGroup(page: number, offset: -1 | 1): boolean {
		const currentGroupIndex = splitRangeState.pageGroupMap.get(page);
		if (currentGroupIndex === undefined) {
			return false;
		}
		return splitRangeState.pageGroupMap.get(page + offset) === currentGroupIndex;
	}

	const splitResolvedOutputDir = $derived.by(() => getSplitTargetDir());

	const splitSubfolderNameValid = $derived.by(() => !splitCreateSubfolder || splitSubfolderName.trim().length > 0);

	const activeRangeLabel = $derived.by(() => {
		if (!splitFile || splitMode !== 'range' || activeRangeGroupIndex === null) {
			return '';
		}
		const range = splitRangeState.ranges[activeRangeGroupIndex];
		return range ? formatRangeLabel(range) : '';
	});

	$effect(() => {
		if (activeRangeGroupIndex === null) {
			return;
		}
		if (activeRangeGroupIndex >= splitRangeState.ranges.length) {
			activeRangeGroupIndex = null;
		}
	});

	$effect(() => {
		let cancelled = false;
		const targetDir = splitResolvedOutputDir;

		if (!splitCreateSubfolder || !splitOutputDir || !splitSubfolderName.trim()) {
			splitSubfolderExists = null;
			return;
		}

		(async () => {
			const exists = await pathExists(targetDir);
			if (!cancelled) {
				splitSubfolderExists = exists;
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	function startMergeDrag(event: PointerEvent, id: string) {
		event.preventDefault();
		draggedPdfId = id;
		mergeDragPointerId = event.pointerId;
	}

	function moveDraggedPdf(targetId: string) {
		if (!draggedPdfId || draggedPdfId === targetId) {
			return;
		}
		mergeHoverTargetId = targetId;
		const fromIndex = pdfFiles.findIndex((file) => file.id === draggedPdfId);
		const toIndex = pdfFiles.findIndex((file) => file.id === targetId);
		if (fromIndex === -1 || toIndex === -1) {
			return;
		}
		const newFiles = [...pdfFiles];
		const [movedFile] = newFiles.splice(fromIndex, 1);
		newFiles.splice(toIndex, 0, movedFile);
		pdfFiles = newFiles;
	}

	function finishMergeDrag(pointerId?: number) {
		if (pointerId !== undefined && mergeDragPointerId !== null && mergeDragPointerId !== pointerId) {
			return;
		}
		draggedPdfId = null;
		mergeDragPointerId = null;
		mergeHoverTargetId = null;
	}

	async function mergePdfs() {
		const sanitizedMergeFileName = mergeFileName.trim().replace(/\.pdf$/i, '');
		if (pdfFiles.length < 2 || !mergeOutputDir || !sanitizedMergeFileName) return;
		processing = true;
		mergeLastSavedPath = '';
		try {
			const mergedPdf = await PDFDocument.create();
			for (const pdfFile of pdfFiles) {
				if (pdfFile.pdfDoc) {
					const pages = await mergedPdf.copyPages(pdfFile.pdfDoc, pdfFile.pdfDoc.getPageIndices());
					pages.forEach(page => mergedPdf.addPage(page));
				}
			}
			const pdfBytes = await mergedPdf.save();
			await saveMergePdf(pdfBytes, `${sanitizedMergeFileName}.pdf`);
			if (!mergeLastSavedPath) {
				processing = false;
				return;
			}
			toast.success($_('pdf.mergeSuccess', { values: { count: pdfFiles.length } }));
		} catch (e) {
			toast.error($_('pdf.mergeFailed'));
		}
		processing = false;
	}

	async function splitPdf() {
		if (!splitFile?.pdfDoc) return;
		if (!splitOutputDir) {
			toast.warning($_('pdf.selectOutputDirFirst'));
			return;
		}
		if (splitCreateSubfolder && !splitSubfolderName.trim()) {
			toast.warning($_('pdf.subfolderNameRequired'));
			return;
		}
		processing = true;
		splitLastSavedDir = '';
		splitLastSavedCount = 0;
		try {
			const doc = splitFile.pdfDoc;
			const totalPages = doc.getPageCount();
			const targetDir = splitResolvedOutputDir;
			if (!targetDir) {
				toast.warning($_('pdf.selectOutputDirFirst'));
				processing = false;
				return;
			}
			if (splitCreateSubfolder) {
				const targetExists = await exists(targetDir);
				splitSubfolderExists = targetExists;
				if (targetExists) {
					const confirmed = await confirm($_('pdf.subfolderExistsConfirmMessage', { values: { path: targetDir } }), {
						title: $_('pdf.subfolderExistsTitle'),
						kind: 'warning',
						okLabel: $_('pdf.continueUseSubfolder'),
						cancelLabel: $_('pdf.stopSplit')
					});

					if (!confirmed) {
						processing = false;
						return;
					}
				} else {
					await mkdir(targetDir, { recursive: true });
				}
			}
			let fileCount = 0;
			splitProgressCurrent = 0;

			if (splitMode === 'each') {
				splitProgressTotal = totalPages;
				for (let i = 0; i < totalPages; i++) {
					const newPdf = await PDFDocument.create();
					const [page] = await newPdf.copyPages(doc, [i]);
					newPdf.addPage(page);
					const pdfBytes = await newPdf.save();
					await savePdfToDirectory(pdfBytes, `page_${i + 1}.pdf`, targetDir);
					fileCount++;
					splitProgressCurrent = fileCount;
					await new Promise(r => setTimeout(r, 100));
				}
			} else if (splitMode === 'range') {
				const rangeState = getRangeState(splitRange, totalPages);
				if (!rangeState.valid) {
					toast.warning($_('pdf.invalidRange'));
					processing = false;
					splitProgressCurrent = 0;
					splitProgressTotal = 0;
					return;
				}
				const ranges = rangeState.ranges;
				splitProgressTotal = ranges.length;
				for (let ri = 0; ri < ranges.length; ri++) {
					const range = ranges[ri];
					const newPdf = await PDFDocument.create();
					const pages = await newPdf.copyPages(doc, range.map(p => p - 1));
					pages.forEach(page => newPdf.addPage(page));
					const pdfBytes = await newPdf.save();
					await savePdfToDirectory(pdfBytes, `pages_${range[0]}-${range[range.length - 1]}.pdf`, targetDir);
					fileCount++;
					splitProgressCurrent = fileCount;
					await new Promise(r => setTimeout(r, 100));
				}
			}
			splitLastSavedDir = targetDir;
			splitLastSavedCount = fileCount;
			toast.success($_('pdf.splitSuccess', { values: { count: fileCount } }));
		} catch (error) {
			console.error('PDF split failed:', {
				error,
				splitOutputDir,
				splitCreateSubfolder,
				splitSubfolderName,
				targetDir: splitResolvedOutputDir
			});
			toast.error(`${$_('pdf.splitFailed')}：${getErrorMessage(error)}`);
		}
		splitProgressTotal = 0;
		processing = false;
	}

	function parseRanges(rangeStr: string, max: number): number[][] {
		const ranges: number[][] = [];
		const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
		if (parts.length === 0) {
			return [];
		}
		for (const part of parts) {
			if (part.includes('-')) {
				const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
				if (!match) {
					return [];
				}
				const start = Number.parseInt(match[1], 10);
				const end = Number.parseInt(match[2], 10);
				if (start < 1 || end > max || start > end) {
					return [];
				}
				const range: number[] = [];
				for (let i = start; i <= end; i++) range.push(i);
				ranges.push(range);
			} else {
				if (!/^\d+$/.test(part)) {
					return [];
				}
				const page = Number.parseInt(part, 10);
				if (page < 1 || page > max) {
					return [];
				}
				ranges.push([page]);
			}
		}
		return ranges;
	}

</script>

<div class="px-6 py-8 max-w-5xl mx-auto">
		<header class="mb-8">
			<h1 class="text-2xl font-bold text-foreground">{$_('features.pdf.title')}</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">{$_('features.pdf.desc')}</p>
		</header>

		<!-- 模式切换 -->
		<div class="mb-6">
			<Tab options={[
				{ value: 'merge', label: $_('pdf.merge'), icon: Merge },
				{ value: 'split', label: $_('pdf.split'), icon: Split }
			]} bind:value={mode} onchange={() => clearAll()} size="default" />
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
							onclick={openPdfDialog}
							onkeydown={(e) => e.key === 'Enter' && openPdfDialog()}
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
								<Button variant="outline" size="sm" onclick={openPdfDialog}>
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
								<p class="text-xs text-slate-400 mb-3">{$_('pdf.reorderHint')}</p>
								{#if draggedPdfId}
									<div class="mb-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
										{$_('pdf.draggingHint')}
									</div>
								{/if}
								<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
									{#each pdfFiles as pdfFile, i}
										<div
											class={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-150 ${
												draggedPdfId === pdfFile.id
													? 'z-10 scale-[1.02] border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
													: mergeHoverTargetId === pdfFile.id
														? 'border-primary/60 bg-primary/5 shadow-md'
														: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
											}`}
											role="listitem"
											aria-grabbed={draggedPdfId === pdfFile.id}
											onpointerenter={() => moveDraggedPdf(pdfFile.id)}
											onpointerup={(event) => finishMergeDrag(event.pointerId)}
										>
											{#if mergeHoverTargetId === pdfFile.id && draggedPdfId !== pdfFile.id}
												<div class="absolute inset-x-3 -top-1 h-1 rounded-full bg-primary/70"></div>
											{/if}
											<button
												type="button"
												class={`shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${draggedPdfId === pdfFile.id ? 'cursor-grabbing' : 'cursor-grab'}`}
												title={$_('pdf.dragHandleTitle')}
											aria-label={$_('pdf.dragHandleTitle')}
											onpointerdown={(event) => startMergeDrag(event, pdfFile.id)}
										>
											<GripVertical class="w-4 h-4" />
										</button>
										<span class="text-sm font-medium text-slate-400 w-6">{i + 1}</span>
										<FileText class="w-5 h-5 text-red-500" />
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium truncate">{pdfFile.name}</p>
											<p class="text-xs text-slate-500">{pdfFile.pageCount} {$_('pdf.pages')}</p>
										</div>
										<div class="flex items-center gap-1">
											<button class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500" onclick={() => removeFile(pdfFile.id)}>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
								</div>
							{/each}
							</div>
								<div class="mt-4">
									<p class="text-sm text-slate-500 mb-2">{$_('pdf.mergeFileName')}</p>
									<div class="flex items-center gap-2">
										<Input bind:value={mergeFileName} placeholder={$_('pdf.mergeFileNamePlaceholder')} class="flex-1" />
										<span class="text-sm text-slate-400">.pdf</span>
									</div>
								</div>
								<div class="mt-4">
									<p class="text-sm text-slate-500 mb-2">{$_('pdf.outputDir')}</p>
									<div class="flex gap-2">
										<Input value={mergeOutputDir} placeholder={$_('pdf.selectDir')} readonly class="flex-1" />
									<Button variant="outline" onclick={selectMergeOutputDir}>
										<FolderOutput class="w-4 h-4 mr-2" />
										{$_('pdf.selectOutputDir')}
									</Button>
								</div>
							</div>
							{#if mergeLastSavedPath}
								<div class="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
									<div class="flex items-center justify-between gap-3">
										<div class="min-w-0">
											<p>{$_('pdf.mergeSavedMessage')}</p>
											<p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{mergeLastSavedPath}</p>
										</div>
										<Button variant="outline" size="sm" onclick={openMergeOutputDir}>
											{$_('pdf.openOutputDir')}
										</Button>
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>

					<div class="flex justify-center">
						<Button onclick={mergePdfs} disabled={processing || pdfFiles.length < 2 || !mergeOutputDir || !mergeFileName.trim()}>
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
							onclick={openPdfDialog}
							onkeydown={(e) => e.key === 'Enter' && openPdfDialog()}
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
								<Tab options={[
									{ value: 'each', label: $_('pdf.splitEach') },
									{ value: 'range', label: $_('pdf.splitRange') }
								]} bind:value={splitMode} />
							</div>
								{#if splitMode === 'range'}
									<div class="grid grid-cols-[minmax(0,1fr)_20rem] gap-4">
										<div class="space-y-3">
											<div class="space-y-1 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
												<p>1. {$_('pdf.rangeInputHint')}</p>
												<p>2. {$_('pdf.rangeDragHint')}</p>
											</div>
											<div class="flex items-center gap-2">
												<input
													type="text"
													class="flex-1 px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
													placeholder={$_('pdf.rangePlaceholder')}
													bind:value={splitRange}
												/>
											</div>
											<p class="text-xs text-slate-400">{$_('pdf.groupRangeHint')}</p>
											<div class="flex flex-wrap gap-1.5">
												{#each splitRangeState.ranges as range, groupIndex}
													<div
														class={`inline-flex items-center gap-1 rounded-full border pr-1 text-[11px] transition-all ${
															activeRangeGroupIndex === groupIndex
																? 'border-primary shadow-sm ring-2 ring-primary/20'
																: 'border-transparent'
														} ${rangeGroupColorClasses[groupIndex % rangeGroupColorClasses.length].badge}`}
													>
														<button
															type="button"
															class="inline-flex items-center gap-1 px-2 py-1"
															onclick={() => selectRangeGroup(groupIndex, range[0])}
														>
															<span class="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-semibold dark:bg-white/10">
																#{groupIndex + 1}
															</span>
															<span>{formatRangeLabel(range)}</span>
														</button>
															<button
																type="button"
																class="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
																aria-label={$_('pdf.deleteGroupAria', { values: { group: groupIndex + 1 } })}
																onclick={() => removeRangeGroup(groupIndex)}
															>
															<X class="h-3 w-3" />
														</button>
													</div>
												{/each}
											</div>
											<div class="grid grid-cols-12 gap-1.5">
												{#each splitPageGrid as page}
													{@const pageGroupIndex = splitRangeState.pageGroupMap.get(page)}
													{@const connectorClass = pageGroupIndex !== undefined ? rangeGroupColorClasses[pageGroupIndex % rangeGroupColorClasses.length].connector : ''}
													<div class="relative">
														{#if isSameRangeGroup(page, -1)}
															<div class={`pointer-events-none absolute left-[-0.375rem] top-1/2 h-0.5 w-[0.5rem] -translate-y-1/2 ${connectorClass}`}></div>
														{/if}
														{#if isSameRangeGroup(page, 1)}
															<div class={`pointer-events-none absolute right-[-0.375rem] top-1/2 h-0.5 w-[0.5rem] -translate-y-1/2 ${connectorClass}`}></div>
														{/if}
															<button
																type="button"
															class={`relative z-10 w-full rounded-md border px-1.5 py-1.5 text-[11px] font-medium leading-none transition-all select-none ${
																pageGroupIndex !== undefined
																	? rangeGroupColorClasses[pageGroupIndex % rangeGroupColorClasses.length].page
																	: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300'
															} ${
																activeRangeGroupIndex !== null && pageGroupIndex === activeRangeGroupIndex
																	? 'ring-2 ring-primary/25 shadow-sm'
																	: ''
															}`}
																aria-label={$_('pdf.previewPageAria', { values: { page } })}
																onclick={() => {
																setSplitPreviewPage(page);
																selectRangeGroup(pageGroupIndex ?? null);
															}}
															onmousedown={(event) => {
																event.preventDefault();
																setSplitPreviewPage(page);
																startRangeDrag(page);
															}}
															onmouseenter={() => {
																setSplitPreviewPage(page);
																applyRangeDrag(page);
															}}
														>
															{page}
														</button>
													</div>
												{/each}
											</div>
											{#if splitRange.trim() && !splitRangeState.valid}
												<p class="text-xs text-red-500">{$_('pdf.invalidRange')}</p>
											{/if}
										</div>
											<div class="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
												<div class="mb-2 flex items-center justify-between">
													<div>
														<p class="text-sm font-medium text-slate-600 dark:text-slate-300">{$_('pdf.previewTitle')}</p>
														{#if activeRangeLabel}
															<p class="mt-0.5 text-xs text-slate-400">{$_('pdf.currentGroupLabel')}：{activeRangeLabel}</p>
														{/if}
													</div>
													<span class="text-xs text-slate-400">{$_('pdf.previewPageLabel', { values: { page: splitPreviewPage } })}</span>
												</div>
												<div class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
													{#if splitPreviewFrameUrl}
														<iframe
															title={$_('pdf.previewPageAria', { values: { page: splitPreviewPage } })}
															src={splitPreviewFrameUrl}
															class="h-96 w-full bg-white dark:bg-slate-950"
														></iframe>
													{:else}
														<div class="flex h-96 items-center justify-center text-sm text-slate-400">
															{$_('pdf.previewEmpty')}
														</div>
													{/if}
											</div>
										</div>
									</div>
								{/if}
							<div>
								<p class="text-sm text-slate-500 mb-2">{$_('pdf.outputDir')}</p>
								<div class="flex gap-2">
									<Input value={splitOutputDir} placeholder={$_('pdf.selectDir')} readonly class="flex-1" />
									<Button variant="outline" onclick={selectSplitOutputDir}>
										<FolderOutput class="w-4 h-4 mr-2" />
										{$_('pdf.selectOutputDir')}
									</Button>
								</div>
							</div>
							{#if splitOutputDir}
								<div class="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-slate-700 dark:text-slate-300">{$_('pdf.createSubfolder')}</span>
										<Switch checked={splitCreateSubfolder} onchange={() => (splitCreateSubfolder = !splitCreateSubfolder)} />
									</div>
									{#if splitCreateSubfolder}
										<div class="space-y-2">
											<Input
												bind:value={splitSubfolderName}
												placeholder={$_('pdf.subfolderPlaceholder')}
											/>
											{#if !splitSubfolderNameValid}
												<p class="text-xs text-red-500">{$_('pdf.subfolderNameRequired')}</p>
											{:else if splitSubfolderExists === true}
												<p class="text-xs text-amber-500">{$_('pdf.subfolderExistsHint')}</p>
											{:else if splitSubfolderExists === false}
												<p class="text-xs text-emerald-500">{$_('pdf.subfolderWillCreateHint')}</p>
											{/if}
										</div>
									{/if}
									<div class="text-xs text-slate-400">
										{$_('pdf.outputPath')}: {splitResolvedOutputDir || splitOutputDir}
									</div>
								</div>
							{/if}
							{#if processing && splitProgressTotal > 0}
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-slate-500">
										<span>{$_('pdf.splitProgress')}</span>
										<span>{splitProgressCurrent} / {splitProgressTotal}</span>
									</div>
									<div class="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
										<div
											class="h-full bg-primary transition-all"
											style={`width: ${(splitProgressCurrent / splitProgressTotal) * 100}%`}
										></div>
									</div>
								</div>
							{/if}
							{#if !processing && splitLastSavedDir}
								<div class="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
									<div class="flex items-center justify-between gap-3">
										<div class="min-w-0">
											<p>{$_('pdf.splitSavedMessage', { values: { count: splitLastSavedCount } })}</p>
											<p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{splitLastSavedDir}</p>
										</div>
										<Button variant="outline" size="sm" onclick={openSplitOutputDir}>
											{$_('pdf.openOutputDir')}
										</Button>
									</div>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<div class="flex justify-center">
					<Button onclick={splitPdf} disabled={processing || !splitOutputDir || (splitMode === 'range' && !splitRangeState.valid)}>
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
	</div>
