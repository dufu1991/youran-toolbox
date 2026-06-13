<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Slider } from '$lib/components/ui/slider';
	import { toast } from '$lib/components/ui/toast';
	import {
		formatBytes,
		mergeSvgIconsToSprite,
		parseSvgSprite,
		sanitizeFileName,
		svgFileToIcon,
		type SvgSplitIcon
	} from '$lib/services/svg-split';
	import { open as openDialog } from '@tauri-apps/plugin-dialog';
	import { mkdir, readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
	import { join } from '@tauri-apps/api/path';
	import { openPath } from '@tauri-apps/plugin-opener';
	import {
		CheckCircle,
		Clipboard,
		Code2,
		Combine,
		Eye,
		Files,
		FolderOpen,
		FolderInput,
		Loader2,
		MousePointerClick,
		Save,
		Search,
		Split,
		Sparkles,
		Upload,
		X
	} from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	type IconView = SvgSplitIcon & { url: string };
	type ToolMode = 'merge' | 'split' | 'browse';

	const getInitialMode = (): ToolMode => {
		const modeValue =
			typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : '';
		return modeValue === 'browse' || modeValue === 'split' ? modeValue : 'merge';
	};

	let icons: IconView[] = $state([]);
	let selectedIcon: IconView | null = $state(null);
	let mode = $state<ToolMode>(getInitialMode());
	let sourceName: string = $state('');
	let sourceDir: string = $state('');
	let outputDir: string = $state('');
	let mergeFileName: string = $state('sprite.svg');
	let searchText: string = $state('');
	let tileSize: number = $state(112);
	let dragging: boolean = $state(false);
	let processing: boolean = $state(false);
	let saving: boolean = $state(false);
	let lastSavedDir: string = $state('');
	let statusMessage: string = $state('');
	let statusError: boolean = $state(false);

	const fileNameFromPath = (path: string) => path.split(/[/\\]/).pop() || path;

	const createIconViews = (nextIcons: SvgSplitIcon[]) =>
		nextIcons.map((icon) => ({
			...icon,
			url: URL.createObjectURL(new Blob([icon.svgText], { type: 'image/svg+xml' }))
		}));

	const revokeIconUrls = () => {
		icons.forEach((icon) => URL.revokeObjectURL(icon.url));
	};

	const normalizeSvgFileName = (value: string) => {
		const baseName = value.trim().replace(/\.svg$/i, '');
		return `${sanitizeFileName(baseName, 'sprite')}.svg`;
	};

	const setIcons = (nextIcons: SvgSplitIcon[], nextSourceName: string, messageKey = 'svgSplit.statusReady') => {
		revokeIconUrls();
		icons = createIconViews(nextIcons);
		selectedIcon = icons[0] ?? null;
		sourceName = nextSourceName;
		searchText = '';
		lastSavedDir = '';
		statusError = false;
		statusMessage = $_(messageKey, { values: { count: icons.length } });
	};

	const setError = (messageKey: string) => {
		revokeIconUrls();
		icons = [];
		selectedIcon = null;
		sourceName = '';
		sourceDir = '';
		lastSavedDir = '';
		statusError = true;
		statusMessage = $_(messageKey);
		toast.error($_(messageKey));
	};

	const filteredIcons = $derived.by(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) return icons;
		return icons.filter((icon) => icon.searchText.includes(query));
	});

	const saveDisabledReason = $derived.by(() => {
		if (mode === 'browse') return '';
		if (icons.length === 0) {
			return mode === 'merge' ? $_('svgSplit.needSvgDirectory') : $_('svgSplit.needSource');
		}
		if (!outputDir) return $_('svgSplit.needOutputDir');
		return '';
	});

	const normalizedMergeFileName = $derived(normalizeSvgFileName(mergeFileName));
	const sourceTitle = $derived(
		mode === 'split' ? $_('svgSplit.sourceTitle') : $_('svgSplit.directorySourceTitle')
	);
	const sourceHint = $derived(
		mode === 'merge'
			? $_('svgSplit.mergeSourceHint')
			: mode === 'browse'
				? $_('svgSplit.browseSourceHint')
				: $_('svgSplit.sourceHint')
	);
	const readyText = $derived(
		mode === 'merge'
			? $_('svgSplit.readyToMerge', { values: { count: icons.length } })
			: $_('svgSplit.readyToSave', { values: { count: icons.length } })
	);
	const saveButtonLabel = $derived(mode === 'merge' ? $_('svgSplit.saveMerged') : $_('svgSplit.saveAll'));
	const emptyTitle = $derived(
		mode === 'merge'
			? $_('svgSplit.mergeEmptyTitle')
			: mode === 'browse'
				? $_('svgSplit.browseEmptyTitle')
				: $_('svgSplit.emptyTitle')
	);
	const emptyDesc = $derived(
		mode === 'merge'
			? $_('svgSplit.mergeEmptyDesc')
			: mode === 'browse'
				? $_('svgSplit.browseEmptyDesc')
				: $_('svgSplit.emptyDesc')
	);

	const switchMode = (nextMode: string) => {
		if (nextMode !== 'split' && nextMode !== 'browse' && nextMode !== 'merge') return;
		if (mode === nextMode) return;
		clearAll();
		mode = nextMode;
	};

	const loadSpriteFromPath = async () => {
		const selected = await openDialog({
			multiple: false,
			filters: [{ name: 'SVG', extensions: ['svg'] }]
		});

		if (!selected || Array.isArray(selected)) return;

		processing = true;
		statusError = false;
		statusMessage = $_('svgSplit.processing');

		try {
			const source = await readTextFile(selected);
			sourceDir = '';
			setIcons(parseSvgSprite(source), fileNameFromPath(selected));
		} catch (error) {
			setError(error instanceof Error ? error.message : 'svgSplit.processFailed');
		} finally {
			processing = false;
		}
	};

	const selectOutputDir = async () => {
		const selected = await openDialog({ directory: true, multiple: false });
		if (!selected || Array.isArray(selected)) return;
		outputDir = selected;
	};

	const loadSvgDirectoryFromPath = async (directoryPath: string) => {
		processing = true;
		statusError = false;
		statusMessage = $_('svgSplit.processing');

		try {
			const entries = (await readDir(directoryPath))
				.filter((entry) => entry.isFile && entry.name.toLowerCase().endsWith('.svg'))
				.sort((a, b) => a.name.localeCompare(b.name));

			if (entries.length === 0) {
				throw new Error('svgSplit.noSvgFilesInDirectory');
			}

			const usedNames = new Set<string>();
			const nextIcons: SvgSplitIcon[] = [];

			for (const [index, entry] of entries.entries()) {
				const filePath = await join(directoryPath, entry.name);
				const source = await readTextFile(filePath);
				nextIcons.push(svgFileToIcon(source, entry.name, index, usedNames, filePath));
			}

			sourceDir = directoryPath;
			if (!outputDir) {
				if (mode === 'merge') {
					outputDir = directoryPath;
				}
			}
			setIcons(
				nextIcons,
				fileNameFromPath(directoryPath),
				mode === 'merge'
					? 'svgSplit.mergeStatusReady'
					: mode === 'browse'
						? 'svgSplit.browseStatusReady'
						: 'svgSplit.multipleFilesSource'
			);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'svgSplit.processFailed');
		} finally {
			processing = false;
		}
	};

	const selectSvgDirectory = async () => {
		const selected = await openDialog({ directory: true, multiple: false });
		if (!selected || Array.isArray(selected)) return;
		await loadSvgDirectoryFromPath(selected);
	};

	const handleDroppedSprite = async (file: File) => {
		processing = true;
		statusError = false;
		statusMessage = $_('svgSplit.processing');

		try {
			const source = await file.text();
			sourceDir = '';
			setIcons(parseSvgSprite(source), file.name);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'svgSplit.processFailed');
		} finally {
			processing = false;
		}
	};

	const handleDroppedFiles = async (fileList: FileList) => {
		const svgFiles = Array.from(fileList).filter((file) => file.name.toLowerCase().endsWith('.svg'));

		if (svgFiles.length === 0) {
			setError('svgSplit.noSvgFilesError');
			return;
		}

		if (svgFiles.length === 1 && mode === 'split') {
			await handleDroppedSprite(svgFiles[0]);
			return;
		}

		processing = true;
		statusError = false;
		statusMessage = $_('svgSplit.processing');

		try {
			const usedNames = new Set<string>();
			const nextIcons: SvgSplitIcon[] = [];

			for (const [index, file] of svgFiles.entries()) {
				const source = await file.text();
				nextIcons.push(svgFileToIcon(source, file.name, index, usedNames));
			}

			sourceDir = '';
			setIcons(
				nextIcons,
				$_('svgSplit.multipleFilesSource', { values: { count: nextIcons.length } }),
				mode === 'merge'
					? 'svgSplit.mergeStatusReady'
					: mode === 'browse'
						? 'svgSplit.browseStatusReady'
						: 'svgSplit.multipleFilesSource'
			);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'svgSplit.processFailed');
		} finally {
			processing = false;
		}
	};

	const handleDrop = async (event: DragEvent) => {
		event.preventDefault();
		dragging = false;

		if (event.dataTransfer?.files) {
			await handleDroppedFiles(event.dataTransfer.files);
		}
	};

	const copySvgText = async () => {
		if (!selectedIcon) return;
		await navigator.clipboard.writeText(selectedIcon.svgText);
		toast.success($_('svgSplit.copySuccess'));
	};

	const saveAll = async () => {
		if (saveDisabledReason) {
			toast.warning(saveDisabledReason);
			return;
		}

		saving = true;

		try {
			await mkdir(outputDir, { recursive: true });

			if (mode === 'merge') {
				const filePath = await join(outputDir, normalizedMergeFileName);
				await writeTextFile(filePath, mergeSvgIconsToSprite(icons, normalizedMergeFileName.replace(/\.svg$/i, '')));
				toast.success($_('svgSplit.mergeSuccess', { values: { fileName: normalizedMergeFileName } }));
			} else {
				for (const icon of icons) {
					const filePath = await join(outputDir, icon.fileName);
					await writeTextFile(filePath, icon.svgText);
				}
				toast.success($_('svgSplit.saveSuccess', { values: { count: icons.length } }));
			}

			lastSavedDir = outputDir;
		} catch {
			toast.error(mode === 'merge' ? $_('svgSplit.mergeFailed') : $_('svgSplit.saveFailed'));
		} finally {
			saving = false;
		}
	};

	const openSavedFolder = async () => {
		if (!lastSavedDir) return;
		await openPath(lastSavedDir);
	};

	const clearAll = () => {
		revokeIconUrls();
		icons = [];
		selectedIcon = null;
		sourceName = '';
		sourceDir = '';
		searchText = '';
		lastSavedDir = '';
		statusMessage = '';
		statusError = false;
	};

	onDestroy(() => {
		revokeIconUrls();
	});
</script>

<div class="px-6 py-8 max-w-5xl mx-auto">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-foreground">{$_('features.svgSplit.title')}</h1>
		<p class="mt-1 text-muted-foreground">{$_('features.svgSplit.desc')}</p>
	</header>

	<section
		aria-label={$_('features.svgSplit.title')}
		class="rounded-lg border border-border/70 bg-card/60"
		ondragenter={(event) => {
			event.preventDefault();
			dragging = true;
		}}
		ondragover={(event) => event.preventDefault()}
		ondragleave={() => (dragging = false)}
		ondrop={handleDrop}
	>
		<div class="space-y-4 border-b border-border/60 p-4">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div
					role="group"
					class="svg-mode-toggle"
					aria-label={$_('svgSplit.modeLabel')}
				>
					<button
						type="button"
						class="svg-mode-item"
						class:is-selected={mode === 'merge'}
						aria-pressed={mode === 'merge'}
						onclick={() => switchMode('merge')}
					>
						<Combine class="h-4 w-4" />
						<span>{$_('svgSplit.modeMerge')}</span>
					</button>
					<button
						type="button"
						class="svg-mode-item"
						class:is-selected={mode === 'split'}
						aria-pressed={mode === 'split'}
						onclick={() => switchMode('split')}
					>
						<Split class="h-4 w-4" />
						<span>{$_('svgSplit.modeSplit')}</span>
					</button>
					<button
						type="button"
						class="svg-mode-item"
						class:is-selected={mode === 'browse'}
						aria-pressed={mode === 'browse'}
						onclick={() => switchMode('browse')}
					>
						<Eye class="h-4 w-4" />
						<span>{$_('svgSplit.modeBrowse')}</span>
					</button>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					{#if mode === 'split'}
						<Button variant="outline" onclick={loadSpriteFromPath} disabled={processing || saving}>
							{#if processing}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								{$_('svgSplit.processing')}
							{:else}
								<Upload class="w-4 h-4 mr-2" />
								{$_('svgSplit.selectSprite')}
							{/if}
						</Button>
					{:else}
						<Button variant="outline" onclick={selectSvgDirectory} disabled={processing || saving}>
							{#if processing}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								{$_('svgSplit.processing')}
							{:else}
								<FolderInput class="w-4 h-4 mr-2" />
								{$_('svgSplit.selectSvgDir')}
							{/if}
						</Button>
					{/if}
					{#if mode !== 'browse'}
						<Button variant="outline" onclick={selectOutputDir} disabled={saving}>
							<FolderOpen class="w-4 h-4 mr-2" />
							{$_('svgSplit.selectOutputDir')}
						</Button>
					{/if}
					{#if icons.length > 0}
						<Button variant="ghost" onclick={clearAll} disabled={processing || saving}>
							<X class="w-4 h-4 mr-2" />
							{$_('svgSplit.clear')}
						</Button>
					{/if}
				</div>
			</div>

			<div class="min-w-0">
				<p class="text-sm font-medium text-foreground">
					{#if sourceName}
						{sourceName}
					{:else}
						{sourceTitle}
					{/if}
				</p>
				<p
					class="mt-1 text-xs"
					class:text-muted-foreground={!statusError}
					class:text-destructive={statusError}
				>
					{#if statusMessage}
						{statusMessage}
					{:else}
						{sourceHint}
					{/if}
				</p>
				{#if sourceDir}
					<p class="mt-1 truncate text-xs text-muted-foreground" title={sourceDir}>{sourceDir}</p>
				{/if}
			</div>
		</div>

		{#if icons.length === 0}
			<div
				class="m-4 flex min-h-64 items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors {dragging
					? 'border-primary bg-primary/5'
					: ''}"
			>
				<div class="max-w-md space-y-4">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						{#if mode === 'merge'}
							<Files class="h-6 w-6" />
						{:else if mode === 'browse'}
							<Eye class="h-6 w-6" />
						{:else}
							<Sparkles class="h-6 w-6" />
						{/if}
					</div>
					<div>
						<p class="text-base font-medium text-foreground">
							{emptyTitle}
						</p>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							{emptyDesc}
						</p>
					</div>
					<div class="flex flex-wrap items-center justify-center gap-2">
						{#if mode === 'split'}
							<Button onclick={loadSpriteFromPath} disabled={processing}>
								<Upload class="w-4 h-4 mr-2" />
								{$_('svgSplit.selectSprite')}
							</Button>
						{:else}
							<Button onclick={selectSvgDirectory} disabled={processing}>
								<FolderInput class="w-4 h-4 mr-2" />
								{$_('svgSplit.selectSvgDir')}
							</Button>
						{/if}
						{#if mode !== 'browse'}
							<Button variant="outline" onclick={selectOutputDir}>
								<FolderOpen class="w-4 h-4 mr-2" />
								{$_('svgSplit.selectOutputDir')}
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<div class="space-y-4 p-4" class:pb-28={mode !== 'browse'}>
				<Card.Root>
					<Card.Content class="py-4">
						<div class="flex flex-wrap items-center gap-4">
							<div class="relative min-w-64 flex-1">
								<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									class="pl-9"
									bind:value={searchText}
									placeholder={$_('svgSplit.searchPlaceholder')}
								/>
							</div>
							<div class="flex min-w-60 items-center gap-3">
								<span class="text-sm text-muted-foreground">{$_('svgSplit.tileSize')}</span>
								<Slider bind:value={tileSize} min={72} max={240} step={8} class="w-32" />
								<span class="w-12 text-right text-xs text-muted-foreground">{tileSize} px</span>
							</div>
							{#if mode === 'merge'}
								<label class="flex items-center gap-2 text-sm text-muted-foreground">
									<span>{$_('svgSplit.mergeFileName')}</span>
									<Input
										class="w-44"
										bind:value={mergeFileName}
										aria-label={$_('svgSplit.mergeFileName')}
									/>
								</label>
							{/if}
							<div class="ml-auto flex flex-wrap gap-2 text-xs text-muted-foreground">
								<span class="rounded-md bg-muted px-2 py-1">
									{$_('svgSplit.totalCount', { values: { count: icons.length } })}
								</span>
								<span class="rounded-md bg-muted px-2 py-1">
									{$_('svgSplit.visibleCount', { values: { count: filteredIcons.length } })}
								</span>
								{#if mode === 'merge'}
									<span class="rounded-md bg-muted px-2 py-1">
										{$_('svgSplit.outputFile', { values: { fileName: normalizedMergeFileName } })}
									</span>
								{/if}
								{#if mode !== 'browse'}
									<span class="max-w-xs truncate rounded-md bg-muted px-2 py-1" title={outputDir}>
										{outputDir || $_('svgSplit.outputNotSelected')}
									</span>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<div class="svg-split-workspace">
					<div>
						{#if filteredIcons.length === 0}
							<Card.Root>
								<Card.Content class="py-12 text-center text-sm text-muted-foreground">
									{$_('svgSplit.noMatch')}
								</Card.Content>
							</Card.Root>
						{:else}
							<div class="svg-icon-grid" style={`--tile-size: ${tileSize}px;`}>
								{#each filteredIcons as icon (icon.fileName)}
									<button
										type="button"
										class="svg-icon-card"
										class:is-selected={selectedIcon?.fileName === icon.fileName}
										title={icon.filePath}
										onclick={() => (selectedIcon = icon)}
									>
										<span class="svg-icon-preview">
											<img src={icon.url} alt={icon.name} loading="lazy" />
										</span>
										<span class="truncate px-2 py-2 text-left text-xs text-muted-foreground">
											{icon.name}
										</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<div class="svg-detail-panel">
						<Card.Root>
							{#if selectedIcon}
								<Card.Header class="pb-3">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<Card.Title class="truncate text-base">{selectedIcon.name}</Card.Title>
											<Card.Description class="mt-1">
												{selectedIcon.viewBox || $_('svgSplit.noViewBox')}
											</Card.Description>
										</div>
										<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
											<MousePointerClick class="h-4 w-4" />
										</div>
									</div>
								</Card.Header>
								<Card.Content class="space-y-4">
									<div class="svg-detail-preview">
										<img src={selectedIcon.url} alt={selectedIcon.name} />
									</div>

									<div class="grid gap-2 text-xs">
										<div class="flex items-center justify-between gap-3">
											<span class="text-muted-foreground">{$_('svgSplit.filePath')}</span>
											<span class="truncate font-medium text-foreground" title={selectedIcon.filePath}>
												{selectedIcon.filePath}
											</span>
										</div>
										<div class="flex items-center justify-between gap-3">
											<span class="text-muted-foreground">{$_('svgSplit.textSize')}</span>
											<span class="font-medium text-foreground">{formatBytes(selectedIcon.bytes)}</span>
										</div>
									</div>

									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
												<Code2 class="h-3.5 w-3.5" />
												{$_('svgSplit.svgCode')}
											</span>
											<Button variant="outline" size="sm" onclick={copySvgText}>
												<Clipboard class="w-4 h-4 mr-1" />
												{$_('svgSplit.copySvgText')}
											</Button>
										</div>
										<textarea
											class="h-64 w-full resize-none rounded-md border border-border bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
											readonly
											spellcheck="false"
											value={selectedIcon.svgText}
										></textarea>
									</div>
								</Card.Content>
							{:else}
								<Card.Content class="py-12 text-center text-sm text-muted-foreground">
									{$_('svgSplit.selectIconHint')}
								</Card.Content>
							{/if}
						</Card.Root>
					</div>
				</div>
			</div>
		{/if}
	</section>

	{#if icons.length > 0 && mode !== 'browse'}
		<div class="svg-save-bar fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="min-w-0 text-sm">
					<p class="font-medium text-foreground">{readyText}</p>
					<p class="mt-0.5 truncate text-xs text-muted-foreground" title={outputDir || saveDisabledReason}>
						{outputDir || saveDisabledReason}
					</p>
				</div>
				<div class="flex items-center gap-2">
					{#if lastSavedDir}
						<Button variant="outline" size="sm" onclick={openSavedFolder}>
							<CheckCircle class="w-4 h-4 mr-1" />
							{$_('svgSplit.openOutputDir')}
						</Button>
					{/if}
					<Button onclick={saveAll} disabled={saving || !!saveDisabledReason}>
						{#if saving}
							<Loader2 class="w-4 h-4 mr-2 animate-spin" />
							{$_('svgSplit.saving')}
						{:else}
							<Save class="w-4 h-4 mr-2" />
							{saveButtonLabel}
						{/if}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.svg-mode-toggle {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-muted);
	}

	.svg-mode-item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		min-height: 2rem;
		padding: 0 0.75rem;
		border-radius: var(--radius-md);
		color: var(--color-muted-foreground);
		font-size: 0.875rem;
		font-weight: 500;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			box-shadow 160ms ease;
	}

	.svg-mode-item:hover {
		color: var(--color-foreground);
	}

	.svg-mode-item:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
		outline-offset: 2px;
	}

	.svg-mode-item.is-selected {
		background: var(--color-card);
		color: var(--color-foreground);
		box-shadow: 0 1px 2px rgb(15 23 42 / 10%);
	}

	.svg-split-workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	.svg-save-bar {
		width: min(46rem, calc(100vw - 2rem));
	}

	@media (min-width: 1024px) {
		.svg-split-workspace {
			grid-template-columns: minmax(0, 1fr) 22rem;
			align-items: start;
		}

		.svg-detail-panel {
			position: sticky;
			top: 1rem;
		}
	}

	.svg-icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--tile-size), 1fr));
		gap: 0.75rem;
	}

	.svg-icon-card {
		display: grid;
		grid-template-rows: var(--tile-size) auto;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-card) 80%, transparent);
		transition:
			border-color 160ms ease,
			box-shadow 160ms ease,
			transform 160ms ease;
	}

	.svg-icon-card:hover,
	.svg-icon-card.is-selected {
		border-color: var(--color-primary);
		box-shadow: 0 10px 24px rgb(15 23 42 / 10%);
		transform: translateY(-1px);
	}

	.svg-icon-card:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
		outline-offset: 2px;
	}

	.svg-icon-preview,
	.svg-detail-preview {
		display: grid;
		place-items: center;
		background:
			linear-gradient(45deg, color-mix(in srgb, var(--color-muted) 80%, white) 25%, transparent 25%),
			linear-gradient(-45deg, color-mix(in srgb, var(--color-muted) 80%, white) 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, color-mix(in srgb, var(--color-muted) 80%, white) 75%),
			linear-gradient(-45deg, transparent 75%, color-mix(in srgb, var(--color-muted) 80%, white) 75%);
		background-color: var(--color-background);
		background-position:
			0 0,
			0 8px,
			8px -8px,
			-8px 0;
		background-size: 16px 16px;
	}

	.svg-icon-preview img {
		display: block;
		width: min(56%, 96px);
		height: min(56%, 96px);
		object-fit: contain;
	}

	.svg-detail-preview {
		height: 12rem;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.svg-detail-preview img {
		display: block;
		width: 6rem;
		height: 6rem;
		object-fit: contain;
	}
</style>
