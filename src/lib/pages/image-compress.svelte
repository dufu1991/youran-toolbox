<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { open } from '@tauri-apps/plugin-dialog';
	import { writeFile, mkdir, readFile } from '@tauri-apps/plugin-fs';
	import { revealItemInDir } from '@tauri-apps/plugin-opener';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from '$lib/components/ui/toast';
	import { Tab } from '$lib/components/ui/tab';
	import { Upload, Download, Trash2, Image, Play, Minimize2, RefreshCw, Settings2, List, Copy, FolderOpen } from 'lucide-svelte';
	import imageCompression from 'browser-image-compression';

	type Mode = 'compress' | 'convert';
	type OutputFormat = 'original' | 'jpeg' | 'webp' | 'png';
	type CompressionMethod = 'keepPixels' | 'resizePixels';
	type KeepPixelsStrategy = 'fixedQuality' | 'targetSize';
	type ResizeDimension = 'width' | 'height';

	interface ImageSettings {
		compressionMethod: CompressionMethod;
		keepPixelsStrategy: KeepPixelsStrategy;
		resizeDimension: ResizeDimension;
		quality: number;
		maxPixelSize: number;
		targetSizeKB: number;
		outputFormat: OutputFormat;
	}

	interface ImageFile {
		id: string;
		file: File;
		path: string; // 文件完整路径
		width: number;
		height: number;
		originalSize: number;
		compressedSize: number | null;
		compressedBlob: Blob | null;
		previewUrl: string;
		compressedUrl: string | null;
		status: 'pending' | 'compressing' | 'done' | 'error';
		error?: string;
		settings: ImageSettings;
		usedFormat?: OutputFormat;
	}

	let mode: Mode = $state('compress');
	let unifiedMode: boolean = $state(true);
	let images: ImageFile[] = $state([]);
	let processing: boolean = $state(false);

	// 复制模式
	let copyMode: boolean = $state(true);
	let copyModeType: 'inplace' | 'archive' = $state('archive'); // 原地复制 | 归档复制
	let outputDir: string = $state('');
	let useSubfolder: boolean = $state(false);
	let subfolderName: string = $state('');
	let lastSavedPath: string = $state('');

	// 全局设置
	let globalCompressionMethod: CompressionMethod = $state('keepPixels');
	let globalKeepPixelsStrategy: KeepPixelsStrategy = $state('fixedQuality');
	let globalResizeDimension: ResizeDimension = $state('width');
	let globalQuality: number = $state(0.8);
	let globalMaxPixelSize: number = $state(1920);
	let globalTargetSizeKB: number = $state(500);
	let globalFormat: OutputFormat = $state('original');

	// 获取默认设置
	function getDefaultSettings(): ImageSettings {
		return {
			compressionMethod: globalCompressionMethod,
			keepPixelsStrategy: globalKeepPixelsStrategy,
			resizeDimension: globalResizeDimension,
			quality: globalQuality,
			maxPixelSize: globalMaxPixelSize,
			targetSizeKB: globalTargetSizeKB,
			outputFormat: mode === 'convert' && globalFormat === 'original' ? 'webp' : globalFormat
		};
	}

	// 切换压缩/转换模式
	function switchMode(newMode: Mode) {
		mode = newMode;
		if (newMode === 'convert' && globalFormat === 'original') {
			globalFormat = 'webp';
		}
		resetAllImages();
	}

	// 重置所有图片状态
	function resetAllImages() {
		images = images.map(img => {
			if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
			const newSettings = unifiedMode ? getDefaultSettings() : {
				...img.settings,
				outputFormat: mode === 'convert' && img.settings.outputFormat === 'original' ? 'webp' : img.settings.outputFormat
			};
			return { ...img, status: 'pending' as const, compressedSize: null, compressedBlob: null, compressedUrl: null, settings: newSettings };
		});
	}

	// 应用全局设置到所有图片
	function applyGlobalSettings() {
		if (!unifiedMode) return;
		images = images.map(img => {
			if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
			return { ...img, status: 'pending' as const, compressedSize: null, compressedBlob: null, compressedUrl: null, settings: getDefaultSettings() };
		});
	}

	// 更新单个图片的设置
	function updateImageSettings(id: string, key: keyof ImageSettings, value: number | OutputFormat | CompressionMethod | KeepPixelsStrategy | ResizeDimension) {
		images = images.map(img => {
			if (img.id === id) {
				if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
				return { ...img, status: 'pending' as const, compressedSize: null, compressedBlob: null, compressedUrl: null, settings: { ...img.settings, [key]: value } };
			}
			return img;
		});
	}

	// 支持的图片格式
	const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

	function getFileExtension(path: string): string {
		const lastDot = path.lastIndexOf('.');
		return lastDot !== -1 ? path.substring(lastDot).toLowerCase() : '';
	}

	function getPathSeparator(path: string): string {
		// Windows 路径可能同时包含 / 和 \，优先检测 \
		if (path.includes('\\')) return '\\';
		return '/';
	}

	function getFileName(path: string): string {
		const sep = getPathSeparator(path);
		return path.substring(path.lastIndexOf(sep) + 1);
	}

	function getFileDir(path: string): string {
		const sep = getPathSeparator(path);
		return path.substring(0, path.lastIndexOf(sep));
	}

	function getMimeType(ext: string): string {
		const mimeTypes: Record<string, string> = {
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.png': 'image/png',
			'.webp': 'image/webp'
		};
		return mimeTypes[ext] || 'application/octet-stream';
	}

	function loadImageDimensions(objectUrl: string): Promise<{ width: number; height: number }> {
		return new Promise((resolve, reject) => {
			const image = new window.Image();
			image.onload = () => {
				resolve({ width: image.naturalWidth, height: image.naturalHeight });
			};
			image.onerror = () => {
				reject(new Error('Failed to read image dimensions'));
			};
			image.src = objectUrl;
		});
	}

	function normalizeTargetSizeKB(value: number): number {
		if (!Number.isFinite(value)) return 500;
		return Math.max(10, Math.round(value));
	}

	function normalizePixelSize(value: number): number {
		if (!Number.isFinite(value)) return 1920;
		return Math.max(100, Math.round(value));
	}

	function getImageMimeType(file: File, settings: ImageSettings): string {
		if (settings.outputFormat !== 'original') {
			return `image/${settings.outputFormat}`;
		}
		return file.type || 'image/jpeg';
	}

	function loadImageElement(file: File): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const objectUrl = URL.createObjectURL(file);
			const image = new window.Image();
			image.onload = () => {
				URL.revokeObjectURL(objectUrl);
				resolve(image);
			};
			image.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				reject(new Error('Failed to load image for resize'));
			};
			image.src = objectUrl;
		});
	}

	async function resizeImageByPixels(file: File, settings: ImageSettings): Promise<File> {
		const image = await loadImageElement(file);
		const limit = normalizePixelSize(settings.maxPixelSize);
		const sourceWidth = image.naturalWidth;
		const sourceHeight = image.naturalHeight;
		const resizeByWidth = settings.resizeDimension === 'width';
		const sourceDimension = resizeByWidth ? sourceWidth : sourceHeight;

		if (sourceDimension <= limit) {
			return file;
		}

		const scale = limit / sourceDimension;
		const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
		const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
		const canvas = document.createElement('canvas');
		canvas.width = targetWidth;
		canvas.height = targetHeight;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Failed to create canvas context');
		}

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

		const mimeType = getImageMimeType(file, settings);
		const blob = await new Promise<Blob | null>((resolve) => {
			canvas.toBlob(resolve, mimeType);
		});
		if (!blob) {
			throw new Error('Failed to export resized image');
		}

		return new File([blob], file.name, { type: mimeType });
	}

	async function openFileDialog() {
		const selected = await open({
			multiple: true,
			directory: false,
			filters: [{
				name: 'Images',
				extensions: ['jpg', 'jpeg', 'png', 'webp']
			}]
		});

		if (selected && selected.length > 0) {
			await addFilesFromPaths(selected);
		}
	}

	async function addFilesFromPaths(paths: string[]) {
		const validPaths = paths.filter(p => supportedExtensions.includes(getFileExtension(p)));
		if (validPaths.length === 0) {
			toast.warning($_('imageCompress.noValidImages'));
			return;
		}

		// 如果没有设置输出目录，使用第一个文件所在的目录
		if (!outputDir && validPaths.length > 0) {
			outputDir = getFileDir(validPaths[0]);
		}

		for (const filePath of validPaths) {
			try {
				// 读取文件内容
				const fileData = await readFile(filePath);
				const fileName = getFileName(filePath);
				const ext = getFileExtension(filePath);
				const mimeType = getMimeType(ext);

				// 创建 File 对象
				const file = new File([fileData], fileName, { type: mimeType });
				const previewUrl = URL.createObjectURL(file);
				const dimensions = await loadImageDimensions(previewUrl);

				const id = crypto.randomUUID();
				images = [...images, {
					id,
					file,
					path: filePath,
					width: dimensions.width,
					height: dimensions.height,
					originalSize: file.size,
					compressedSize: null,
					compressedBlob: null,
					previewUrl,
					compressedUrl: null,
					status: 'pending',
					settings: getDefaultSettings()
				}];
			} catch (e) {
				console.error(`Failed to load image: ${filePath}`, e);
			}
		}
	}

	function removeImage(id: string) {
		const img = images.find(i => i.id === id);
		if (img) {
			URL.revokeObjectURL(img.previewUrl);
			if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
		}
		images = images.filter(i => i.id !== id);
	}

	function clearAll() {
		for (const img of images) {
			URL.revokeObjectURL(img.previewUrl);
			if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
		}
		images = [];
	}

	async function compressAll() {
		processing = true;
		let successCount = 0;
		let failCount = 0;
		for (let i = 0; i < images.length; i++) {
			if (images[i].status === 'done') continue;
			images[i].status = 'compressing';
			const settings = unifiedMode ? getDefaultSettings() : images[i].settings;
			try {
				const compressed = mode === 'compress' && settings.compressionMethod === 'keepPixels' && settings.keepPixelsStrategy === 'targetSize'
					? await compressToTargetSize(images[i], settings)
					: await compressWithSettings(images[i].file, settings, settings.quality);
				images[i].compressedBlob = compressed;
				images[i].compressedSize = compressed.size;
				images[i].compressedUrl = URL.createObjectURL(compressed);
				images[i].usedFormat = settings.outputFormat;
				images[i].status = 'done';
				successCount++;
			} catch (e) {
				images[i].status = 'error';
				images[i].error = String(e);
				failCount++;
			}
		}
		processing = false;
		if (successCount > 0) {
			const msgKey = mode === 'convert' ? 'imageCompress.convertSuccess' : 'imageCompress.compressSuccess';
			toast.success($_(msgKey, { values: { count: successCount } }));
		}
		if (failCount > 0) {
			const msgKey = mode === 'convert' ? 'imageCompress.convertFailed' : 'imageCompress.compressFailed';
			toast.error($_(msgKey, { values: { count: failCount } }));
		}
	}

	async function compressWithSettings(file: File, settings: ImageSettings, quality: number) {
		if (mode === 'compress' && settings.compressionMethod === 'resizePixels') {
			return resizeImageByPixels(file, settings);
		}

		const options: Parameters<typeof imageCompression>[1] = {
			maxSizeMB: mode === 'convert' ? 100 : 10,
			maxWidthOrHeight: mode === 'convert' ? 16384 : undefined,
			useWebWorker: true,
			initialQuality: mode === 'convert' ? 1 : quality
		};
		if (settings.outputFormat !== 'original') {
			options.fileType = `image/${settings.outputFormat}`;
		}
		return imageCompression(file, options);
	}

	async function compressToTargetSize(img: ImageFile, settings: ImageSettings) {
		const targetBytes = normalizeTargetSizeKB(settings.targetSizeKB) * 1024;
		if (img.originalSize <= targetBytes) {
			return img.file;
		}

		let bestResult = await compressWithSettings(img.file, settings, 0.95);
		if (bestResult.size <= targetBytes) {
			return bestResult;
		}

		for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]) {
			const compressed = await compressWithSettings(img.file, settings, quality);
			if (compressed.size < bestResult.size) {
				bestResult = compressed;
			}
			if (compressed.size <= targetBytes) {
				return compressed;
			}
		}

		return bestResult;
	}

	// 计算实际输出目录
	const actualOutputDir = $derived.by(() => {
		if (!copyMode) return '';
		if (copyModeType === 'inplace') return ''; // 原地复制不需要统一输出目录
		if (!outputDir) return outputDir;
		if (useSubfolder && subfolderName.trim()) {
			const sep = getPathSeparator(outputDir);
			return `${outputDir}${sep}${subfolderName.trim()}`;
		}
		return outputDir;
	});

	async function selectOutputDir() {
		const selected = await open({
			directory: true,
			multiple: false,
			title: $_('imageCompress.selectOutputDir')
		});
		if (selected) {
			outputDir = selected as string;
		}
	}

	function getOutputFileName(img: ImageFile): string {
		const format = img.usedFormat || img.settings.outputFormat;
		const ext = format === 'original' ? img.file.name.split('.').pop() : format;
		const baseName = img.file.name.replace(/\.[^.]+$/, '');
		const suffix = mode === 'convert' ? '' : '_compressed';
		return `${baseName}${suffix}.${ext}`;
	}

	async function saveImageToDir(img: ImageFile) {
		if (!img.compressedBlob) return false;

		// 确定目标目录
		let targetDir: string;
		if (copyModeType === 'inplace') {
			// 原地复制：使用原文件所在目录
			targetDir = getFileDir(img.path);
		} else {
			// 归档复制：使用统一输出目录
			if (!actualOutputDir) return false;
			targetDir = actualOutputDir;
		}

		try {
			const fileName = getOutputFileName(img);
			const sep = getPathSeparator(targetDir);
			const filePath = `${targetDir}${sep}${fileName}`;

			// 确保目录存在（仅归档模式且使用子文件夹时）
			if (copyModeType === 'archive' && useSubfolder && subfolderName.trim()) {
				await mkdir(actualOutputDir, { recursive: true });
			}

			// 将 Blob 转为 Uint8Array
			const arrayBuffer = await img.compressedBlob.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			await writeFile(filePath, uint8Array);
			lastSavedPath = filePath;
			return true;
		} catch (e) {
			console.error('Failed to save image:', e);
			return false;
		}
	}

	function downloadImage(img: ImageFile) {
		if (!img.compressedBlob) return;
		const link = document.createElement('a');
		link.download = getOutputFileName(img);
		link.href = img.compressedUrl!;
		link.click();
	}

	async function downloadAll() {
		const doneImages = images.filter(i => i.status === 'done');

		if (copyMode) {
			// 保存到指定目录（原地复制或归档复制）
			let successCount = 0;
			for (const img of doneImages) {
				if (await saveImageToDir(img)) {
					successCount++;
				}
			}
			if (successCount > 0) {
				toast.success($_('imageCompress.saveSuccess', { values: { count: successCount } }));
			}
		} else {
			// 浏览器下载
			for (const img of doneImages) {
				downloadImage(img);
				await new Promise(r => setTimeout(r, 100));
			}
			toast.success($_('imageCompress.downloadAllStarted', { values: { count: doneImages.length } }));
		}
	}

	async function openSavedFolder() {
		if (lastSavedPath) {
			await revealItemInDir(lastSavedPath);
		} else if (actualOutputDir) {
			await revealItemInDir(actualOutputDir);
		}
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	function formatDimensions(width: number, height: number): string {
		return `${width} × ${height}`;
	}

	function getResultDimensions(img: ImageFile): { width: number; height: number } {
		const settings = unifiedMode ? getDefaultSettings() : img.settings;
		if (settings.compressionMethod !== 'resizePixels') {
			return { width: img.width, height: img.height };
		}

		const sourceDimension = settings.resizeDimension === 'width' ? img.width : img.height;
		const limitedDimension = normalizePixelSize(settings.maxPixelSize);
		if (sourceDimension <= limitedDimension) {
			return { width: img.width, height: img.height };
		}

		const scale = limitedDimension / sourceDimension;
		return {
			width: Math.max(1, Math.round(img.width * scale)),
			height: Math.max(1, Math.round(img.height * scale))
		};
	}

	function getPendingResultText(img: ImageFile): string {
		if (shouldSkipCompression(img)) {
			return `${formatSize(img.originalSize)} | ${formatDimensions(img.width, img.height)}`;
		}
		const resultDimensions = getResultDimensions(img);
		return `${formatSize(getEstimatedCompressedSize(img))} | ${formatDimensions(resultDimensions.width, resultDimensions.height)}`;
	}

	function getSizeDelta(bytesBefore: number, bytesAfter: number): number {
		return Math.abs(bytesBefore - bytesAfter);
	}

	function getSizeChangePercent(bytesBefore: number, bytesAfter: number): string {
		if (bytesBefore <= 0) return '0.0';
		return (Math.abs((1 - bytesAfter / bytesBefore) * 100)).toFixed(1);
	}

	function getSizeChangeLabel(bytesBefore: number, bytesAfter: number): string {
		if (bytesAfter === bytesBefore) {
			return $_('imageCompress.sizeUnchanged');
		}
		return bytesAfter < bytesBefore
			? $_('imageCompress.sizeSaved', { values: { size: formatSize(getSizeDelta(bytesBefore, bytesAfter)) } })
			: $_('imageCompress.sizeIncreased', { values: { size: formatSize(getSizeDelta(bytesBefore, bytesAfter)) } });
	}

	function getEstimatedCompressedSize(img: ImageFile): number {
		const settings = unifiedMode ? getDefaultSettings() : img.settings;
		if (mode === 'compress' && settings.compressionMethod === 'keepPixels' && settings.keepPixelsStrategy === 'targetSize') {
			return Math.min(img.originalSize, normalizeTargetSizeKB(settings.targetSizeKB) * 1024);
		}
		const shouldResize = mode === 'compress' && settings.compressionMethod === 'resizePixels';
		const sourceDimension = settings.resizeDimension === 'width' ? img.width : img.height;
		const pixelRatio = shouldResize && settings.maxPixelSize > 0 && sourceDimension > settings.maxPixelSize
			? settings.maxPixelSize / sourceDimension
			: 1;
		const areaRatio = Math.min(1, pixelRatio * pixelRatio);
		const sourceFormat = img.file.type.replace('image/', '').toLowerCase();
		const targetFormat = settings.outputFormat === 'original'
			? (sourceFormat === 'jpeg' ? 'jpg' : sourceFormat)
			: settings.outputFormat;

		const qualityFactorMap: Record<string, number> = {
			jpg: 0.55,
			jpeg: 0.55,
			webp: 0.45,
			png: 0.9
		};
		const sourceFactorMap: Record<string, number> = {
			jpg: 1,
			jpeg: 1,
			png: 1.35,
			webp: 0.85
		};
		const formatFactorMap: Record<string, number> = {
			jpg: 1,
			jpeg: 1,
			webp: 0.82,
			png: 1.6
		};
		const qualityBase = qualityFactorMap[targetFormat] ?? 0.7;
		const sourceFactor = sourceFactorMap[sourceFormat] ?? 1;
		const formatFactor = formatFactorMap[targetFormat] ?? 1;
		const qualityRatio = mode === 'convert' && targetFormat === 'png'
			? 1
			: (0.45 + settings.quality * qualityBase);
		const estimated = img.originalSize * areaRatio * qualityRatio * formatFactor / sourceFactor;
		return Math.max(1024, Math.round(estimated));
	}

	function getFormatLabel(format: OutputFormat): string {
		if (format === 'original') return $_('imageCompress.keepOriginal');
		return format.toUpperCase();
	}

	function getCompressionMethodLabel(method: CompressionMethod): string {
		return method === 'keepPixels' ? $_('imageCompress.keepPixels') : $_('imageCompress.resizePixels');
	}

	function getKeepPixelsStrategyLabel(strategy: KeepPixelsStrategy): string {
		return strategy === 'fixedQuality' ? $_('imageCompress.fixedQuality') : $_('imageCompress.targetSizeMode');
	}

	function getResizeDimensionLabel(dimension: ResizeDimension): string {
		return dimension === 'width' ? $_('imageCompress.maxWidth') : $_('imageCompress.maxHeight');
	}

	function shouldSkipCompression(img: ImageFile): boolean {
		const settings = unifiedMode ? getDefaultSettings() : img.settings;
		return mode === 'compress'
			&& settings.compressionMethod === 'keepPixels'
			&& settings.keepPixelsStrategy === 'targetSize'
			&& img.originalSize <= normalizeTargetSizeKB(settings.targetSizeKB) * 1024;
	}

	const totalOriginal = $derived(images.reduce((sum, img) => sum + img.originalSize, 0));
	const totalCompressed = $derived(images.reduce((sum, img) => sum + (img.compressedSize || 0), 0));
	const savedPercent = $derived(totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100).toFixed(1) : '0');
	const doneCount = $derived(images.filter(i => i.status === 'done').length);
</script>

<div class="px-6 py-8 max-w-5xl mx-auto">
		<header class="mb-8">
			<h1 class="text-2xl font-bold text-foreground">{$_('features.imageCompress.title')}</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">{$_('features.imageCompress.desc')}</p>
		</header>

		<!-- 模式切换 -->
		<div class="mb-6">
			<Tab options={[
				{ value: 'compress', label: $_('imageCompress.modeCompress'), icon: Minimize2 },
				{ value: 'convert', label: $_('imageCompress.modeConvert'), icon: RefreshCw }
			]} bind:value={mode} onchange={(v) => switchMode(v as Mode)} size="default" />
		</div>

		<!-- 选择文件 -->
		<Card.Root class="mb-6">
			<Card.Header class="pb-4">
				<Card.Title class="text-base">{$_('imageCompress.selectImages')}</Card.Title>
				<Card.Description>{$_('imageCompress.supportMultiple')}</Card.Description>
			</Card.Header>
			<Card.Content class="pt-0">
				<Button variant="outline" onclick={openFileDialog}>
					<Upload class="w-4 h-4 mr-2" />
					{$_('imageCompress.addImages')}
				</Button>
			</Card.Content>
		</Card.Root>

		{#if images.length > 0}
			<!-- 设置区域 -->
			<Card.Root class="mb-6">
				<Card.Header class="pb-4">
					<div class="flex items-center justify-between">
						<div>
							<Card.Title class="text-base">{$_('imageCompress.settings')}</Card.Title>
							<Card.Description>{$_('imageCompress.settingsDesc')}</Card.Description>
						</div>
						<Tab options={[
							{ value: true, label: $_('imageCompress.unified'), icon: Settings2 },
							{ value: false, label: $_('imageCompress.individual'), icon: List }
						]} bind:value={unifiedMode} onchange={(v) => { if (v) applyGlobalSettings(); }} disabled={processing} />
					</div>
				</Card.Header>

				{#if unifiedMode}
					<Card.Content class="pt-0 space-y-4">
						{#if mode === 'compress'}
							<div>
								<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									{$_('imageCompress.compressionMethod')} <HintIcon text={$_('imageCompress.compressionMethodHint')} />
								</p>
								<Tab options={[
									{ value: 'keepPixels', label: $_('imageCompress.keepPixels') },
									{ value: 'resizePixels', label: $_('imageCompress.resizePixels') }
								]} bind:value={globalCompressionMethod} onchange={applyGlobalSettings} disabled={processing} />
							</div>
							{#if globalCompressionMethod === 'keepPixels'}
								<div>
									<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
										{$_('imageCompress.keepPixelsStrategy')} <HintIcon text={$_('imageCompress.keepPixelsStrategyHint')} />
									</p>
									<Tab options={[
										{ value: 'fixedQuality', label: $_('imageCompress.fixedQuality') },
										{ value: 'targetSize', label: $_('imageCompress.targetSizeMode') }
									]} bind:value={globalKeepPixelsStrategy} onchange={applyGlobalSettings} disabled={processing} />
								</div>
								{#if globalKeepPixelsStrategy === 'fixedQuality'}
									<div>
										<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
											{$_('imageCompress.quality')} <HintIcon text={$_('imageCompress.qualityHint')} />
										</p>
										<div class="flex items-center gap-3">
											<Slider
												bind:value={globalQuality}
												min={0.1}
												max={1}
												step={0.1}
												onchange={applyGlobalSettings}
												class="w-48"
												disabled={processing}
											/>
											<span class="text-sm font-medium w-12">{Math.round(globalQuality * 100)}%</span>
										</div>
									</div>
								{:else}
									<div>
										<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
											{$_('imageCompress.targetSize')} <HintIcon text={$_('imageCompress.targetSizeHint')} />
										</p>
										<div class="flex items-center gap-3">
											<input
												type="number"
												min="10"
												step="10"
												bind:value={globalTargetSizeKB}
												onchange={() => {
													globalTargetSizeKB = normalizeTargetSizeKB(globalTargetSizeKB);
													applyGlobalSettings();
												}}
												class="w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
												disabled={processing}
											/>
											<span class="text-sm text-slate-500 dark:text-slate-400">KB</span>
										</div>
									</div>
								{/if}
							{:else}
								<div>
									<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
										{$_('imageCompress.resizeDimension')} <HintIcon text={$_('imageCompress.resizeDimensionHint')} />
									</p>
									<Tab options={[
										{ value: 'width', label: $_('imageCompress.maxWidth') },
										{ value: 'height', label: $_('imageCompress.maxHeight') }
									]} bind:value={globalResizeDimension} onchange={applyGlobalSettings} disabled={processing} />
								</div>
								<div>
									<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
										{globalResizeDimension === 'width' ? $_('imageCompress.maxWidth') : $_('imageCompress.maxHeight')} <HintIcon text={$_('imageCompress.resizePixelHint')} />
									</p>
									<Tab options={[800, 1280, 1920, 2560, 4096].map(v => ({ value: v, label: `${v}px` }))} bind:value={globalMaxPixelSize} onchange={applyGlobalSettings} disabled={processing} />
								</div>
							{/if}
						{/if}
						{#if mode === 'convert'}
							<div>
								<p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									{$_('imageCompress.format')} <HintIcon text={$_('imageCompress.formatHint')} />
								</p>
								<Tab options={[
								{ value: 'jpeg', label: 'JPEG' },
								{ value: 'png', label: 'PNG' },
								{ value: 'webp', label: 'WEBP' }
							]} bind:value={globalFormat} onchange={applyGlobalSettings} disabled={processing} />
							</div>
						{/if}
					</Card.Content>
				{/if}
			</Card.Root>

			<Card.Root class="mb-6">
				<Card.Content class="py-4">
					<div class="rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
						<p class="font-medium">{$_('imageCompress.sizeExplanationTitle')}</p>
						<p class="mt-1 leading-6">{$_('imageCompress.sizeExplanationDesc')}</p>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- 图片列表 -->
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
				{#each images as img}
					<Card.Root class={img.status === 'done' ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/30' : img.status === 'error' ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/30' : ''}>
						<Card.Header class="pb-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<img src={img.previewUrl} alt="" class="w-12 h-12 object-cover rounded-sm" />
									<div>
										<Card.Title class="text-sm">{img.file.name}</Card.Title>
										<Card.Description class="text-xs">
											<span class="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{$_('imageCompress.originalInfoLabel')}</span>
											<span class="ml-2">{formatSize(img.originalSize)} | {formatDimensions(img.width, img.height)}</span>
										</Card.Description>
										<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
											<span class="inline-flex rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
												{img.compressedSize !== null ? $_('imageCompress.resultSizeLabel') : $_('imageCompress.estimatedResultLabel')}
											</span>
											<span class="ml-2">
											{#if img.compressedSize !== null}
												{formatSize(img.compressedSize)} | {formatDimensions(getResultDimensions(img).width, getResultDimensions(img).height)}
											{:else}
												{getPendingResultText(img)}
											{/if}
											</span>
										</p>
										<p
											class="mt-1 text-xs"
											class:text-slate-400={img.compressedSize === null}
											class:text-green-600={img.compressedSize !== null && img.compressedSize < img.originalSize}
											class:text-red-600={img.compressedSize !== null && img.compressedSize >= img.originalSize}
										>
											{#if img.compressedSize !== null}
												{getSizeChangeLabel(img.originalSize, img.compressedSize)}
												{#if img.compressedSize !== img.originalSize}
													（{img.compressedSize < img.originalSize ? '-' : '+'}{getSizeChangePercent(img.originalSize, img.compressedSize)}%）
												{/if}
											{:else}
												<span class="inline-flex items-center gap-1">
													{#if shouldSkipCompression(img)}
														{$_('imageCompress.willSkipCompression')}
														<HintIcon text={$_('imageCompress.willSkipCompressionHint')} tooltipMinWidth="220px" tooltipMaxWidth="280px" />
													{:else if (unifiedMode ? getDefaultSettings() : img.settings).compressionMethod === 'keepPixels' && (unifiedMode ? getDefaultSettings() : img.settings).keepPixelsStrategy === 'targetSize'}
														{$_('imageCompress.targetSizeLabel', { values: { size: `${normalizeTargetSizeKB((unifiedMode ? getDefaultSettings() : img.settings).targetSizeKB)} KB` } })}
														<HintIcon text={$_('imageCompress.targetSizeHint')} tooltipMinWidth="220px" tooltipMaxWidth="280px" />
													{:else}
														{$_('imageCompress.estimatedSize', { values: { size: formatSize(getEstimatedCompressedSize(img)) } })}
														<HintIcon text={$_('imageCompress.estimatedSizeHint')} tooltipMinWidth="220px" tooltipMaxWidth="280px" />
													{/if}
												</span>
											{/if}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									{#if img.status === 'compressing'}
										<span class="text-xs text-blue-500">{$_('imageCompress.compressing')}</span>
									{:else if img.status === 'done'}
										<Button variant="ghost" size="icon" onclick={() => downloadImage(img)}>
											<Download class="w-4 h-4" />
										</Button>
									{:else if img.status === 'error'}
										<span class="text-xs text-red-500">{$_('imageCompress.error')}</span>
									{/if}
									<Button variant="ghost" size="icon" onclick={() => removeImage(img.id)} disabled={processing}>
										<Trash2 class="w-4 h-4" />
									</Button>
								</div>
							</div>
						</Card.Header>

						<!-- 单独设置模式下显示设置 -->
						{#if !unifiedMode && img.status !== 'done'}
							<Card.Content class="pt-0 space-y-3">
								{#if mode === 'compress'}
									<div>
										<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{$_('imageCompress.compressionMethod')}</p>
										<Tab options={[
											{ value: 'keepPixels', label: $_('imageCompress.keepPixels') },
											{ value: 'resizePixels', label: $_('imageCompress.resizePixels') }
										]} value={img.settings.compressionMethod} onchange={(v) => updateImageSettings(img.id, 'compressionMethod', v as CompressionMethod)} disabled={processing} />
									</div>
									{#if img.settings.compressionMethod === 'keepPixels'}
										<div>
											<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{$_('imageCompress.keepPixelsStrategy')}</p>
											<Tab options={[
												{ value: 'fixedQuality', label: $_('imageCompress.fixedQuality') },
												{ value: 'targetSize', label: $_('imageCompress.targetSizeMode') }
											]} value={img.settings.keepPixelsStrategy} onchange={(v) => updateImageSettings(img.id, 'keepPixelsStrategy', v as KeepPixelsStrategy)} disabled={processing} />
										</div>
										{#if img.settings.keepPixelsStrategy === 'fixedQuality'}
											<div>
												<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{$_('imageCompress.quality')}</p>
												<div class="flex items-center gap-3">
													<Slider
														value={img.settings.quality}
														min={0.1}
														max={1}
														step={0.1}
														onchange={(nextQuality) => updateImageSettings(img.id, 'quality', nextQuality)}
														class="w-32"
														disabled={processing}
													/>
													<span class="text-xs font-medium w-10">{Math.round(img.settings.quality * 100)}%</span>
												</div>
											</div>
										{:else}
											<div>
												<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{$_('imageCompress.targetSize')}</p>
												<div class="flex items-center gap-3">
													<input
														type="number"
														min="10"
														step="10"
														value={img.settings.targetSizeKB}
														onchange={(e) => updateImageSettings(img.id, 'targetSizeKB', normalizeTargetSizeKB(parseFloat((e.target as HTMLInputElement).value)))}
														class="w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
														disabled={processing}
													/>
													<span class="text-xs text-slate-500 dark:text-slate-400">KB</span>
												</div>
											</div>
										{/if}
									{:else}
										<div>
											<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{$_('imageCompress.resizeDimension')}</p>
											<Tab options={[
												{ value: 'width', label: $_('imageCompress.maxWidth') },
												{ value: 'height', label: $_('imageCompress.maxHeight') }
											]} value={img.settings.resizeDimension} onchange={(v) => updateImageSettings(img.id, 'resizeDimension', v as ResizeDimension)} disabled={processing} />
										</div>
										<div>
											<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{img.settings.resizeDimension === 'width' ? $_('imageCompress.maxWidth') : $_('imageCompress.maxHeight')}</p>
											<Tab options={[800, 1280, 1920, 2560, 4096].map(v => ({ value: v, label: String(v) }))} value={img.settings.maxPixelSize} onchange={(v) => updateImageSettings(img.id, 'maxPixelSize', v)} disabled={processing} />
										</div>
									{/if}
								{/if}
								{#if mode === 'convert'}
									<div>
										<p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{$_('imageCompress.format')}</p>
										<Tab options={[
											{ value: 'jpeg', label: 'JPEG' },
											{ value: 'png', label: 'PNG' },
											{ value: 'webp', label: 'WEBP' }
										]} value={img.settings.outputFormat} onchange={(v) => updateImageSettings(img.id, 'outputFormat', v)} disabled={processing} />
									</div>
								{/if}
							</Card.Content>
						{/if}

						<!-- 统一设置模式下显示当前设置摘要 -->
						{#if unifiedMode && img.status !== 'done'}
							<Card.Content class="pt-0">
								<p class="text-xs text-slate-500">
									{#if mode === 'compress'}
									{#if globalCompressionMethod === 'keepPixels'}
											{$_('imageCompress.compressionMethod')}: {getCompressionMethodLabel(globalCompressionMethod)} | {$_('imageCompress.keepPixelsStrategy')}: {getKeepPixelsStrategyLabel(globalKeepPixelsStrategy)}{globalKeepPixelsStrategy === 'fixedQuality' ? ` | ${$_('imageCompress.quality')}: ${Math.round(globalQuality * 100)}%` : ` | ${$_('imageCompress.targetSize')}: ${normalizeTargetSizeKB(globalTargetSizeKB)} KB`}
										{:else}
											{$_('imageCompress.compressionMethod')}: {getCompressionMethodLabel(globalCompressionMethod)} | {getResizeDimensionLabel(globalResizeDimension)}: {globalMaxPixelSize}px
										{/if}
									{:else}
										{$_('imageCompress.format')}: {getFormatLabel(globalFormat)}
									{/if}
								</p>
							</Card.Content>
						{/if}
					</Card.Root>
				{/each}
			</div>

			<!-- 统计和操作按钮 -->
			{#if totalCompressed > 0}
				<div class="text-center text-sm text-slate-500 mb-4">
					{formatSize(totalOriginal)} → {formatSize(totalCompressed)}
					<span class="text-green-600 dark:text-green-400 ml-2">-{savedPercent}%</span>
				</div>
			{/if}

			<!-- 输出设置 -->
			<Card.Root class="mb-4">
				<Card.Content class="py-4">
					<div class="flex flex-wrap items-center gap-6">
						<div class="flex items-center gap-3">
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300">{$_('imageCompress.copyMode')} <HintIcon text={$_('imageCompress.copyModeHint')} /></span>
							<Switch checked={copyMode} onchange={() => (copyMode = !copyMode)} />
						</div>
						{#if copyMode}
							<div class="flex items-center gap-3">
								<span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{$_('imageCompress.copyModeType')}:</span>
								<Tab options={[
									{ value: 'inplace', label: $_('imageCompress.copyModeInplace') },
									{ value: 'archive', label: $_('imageCompress.copyModeArchive') }
								]} bind:value={copyModeType} />
								<HintIcon text={copyModeType === 'inplace' ? $_('imageCompress.copyModeInplaceHint') : $_('imageCompress.copyModeArchiveHint')} />
							</div>
						{/if}
					</div>
					{#if copyMode && copyModeType === 'archive'}
						<div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div class="flex items-center gap-2 flex-1 min-w-0">
								<span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{$_('imageCompress.outputDir')}:</span>
								<div class="flex-1 min-w-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-sm truncate">
									{outputDir || $_('imageCompress.notSelected')}
								</div>
								<Button variant="outline" size="sm" onclick={selectOutputDir}>
									{$_('imageCompress.select')}
								</Button>
							</div>
						</div>
						{#if outputDir}
							<div class="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
								<div class="flex items-center gap-3">
									<span class="text-sm text-slate-500 dark:text-slate-400">{$_('imageCompress.createSubfolder')}</span>
									<Switch size="sm" checked={useSubfolder} onchange={() => (useSubfolder = !useSubfolder)} />
								</div>
								{#if useSubfolder}
									<input
										type="text"
										class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 w-40"
										placeholder={$_('imageCompress.subfolderPlaceholder')}
										bind:value={subfolderName}
									/>
								{/if}
								{#if useSubfolder && subfolderName.trim()}
									<div class="text-xs text-slate-400">
										{$_('imageCompress.outputPath')}: {actualOutputDir}
									</div>
								{/if}
							</div>
						{/if}
					{/if}
				</Card.Content>
			</Card.Root>

			<div class="flex justify-center gap-3">
				<Button disabled={processing || (copyMode && copyModeType === 'archive' && !outputDir)} onclick={compressAll}>
					{#if processing}
						<span class="animate-spin mr-2">⏳</span>
						{$_('imageCompress.processing')} ({doneCount}/{images.length})
					{:else}
						<Play class="w-4 h-4 mr-2" />
						{mode === 'compress' ? $_('imageCompress.startCompress') : $_('imageCompress.startConvert')}
					{/if}
				</Button>
				{#if images.some(i => i.status === 'done')}
					<Button variant="outline" onclick={downloadAll} disabled={copyMode && copyModeType === 'archive' && !outputDir}>
						{#if copyMode}
							<Copy class="w-4 h-4 mr-2" />
							{$_('imageCompress.saveAll')}
						{:else}
							<Download class="w-4 h-4 mr-2" />
							{$_('imageCompress.downloadAll')}
						{/if}
					</Button>
					{#if copyMode && lastSavedPath}
						<Button variant="outline" onclick={openSavedFolder}>
							<FolderOpen class="w-4 h-4 mr-2" />
							{$_('imageCompress.openFolder')}
						</Button>
					{/if}
				{/if}
				<Button variant="outline" onclick={clearAll} disabled={processing}>
					{$_('imageCompress.clearAll')}
				</Button>
			</div>
		{/if}
	</div>
