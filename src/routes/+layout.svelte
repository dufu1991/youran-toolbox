<script lang="ts">
	import '../app.css';
	import '$lib/i18n';
	import { _, isLoading } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { Toast } from '$lib/components/ui/toast';
	import { Button } from '$lib/components/ui/button';
	import { ThemeToggle } from '$lib/components/ui/theme-toggle';
	import { LocaleSwitcher } from '$lib/components/ui/locale-switcher';
	import { Titlebar } from '$lib/components/ui/titlebar';
	import { Switch } from '$lib/components/ui/switch';
	import { Slider } from '$lib/components/ui/slider';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import * as Popover from '$lib/components/ui/popover';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';

	import {
		appSettings,
		applyPrimaryColor,
		colorOptions,
		theme
	} from '$lib/stores/settings.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		ensureCurrentVersionLoaded,
		handleUpdateCheck,
		updateInfo
	} from '$lib/services/update';
	import {
		Layers,
		FileText,
		QrCode,
		Image,
		FileType,
		GitCompare,
		Grid3x3,
		Settings,
		RotateCcw
	} from 'lucide-svelte';

	// Keep-alive 页面组件
	import RenamePage from '$lib/pages/rename.svelte';
	import ClassifyBatchPage from '$lib/pages/classify-batch.svelte';
	import ImageCompressPage from '$lib/pages/image-compress.svelte';
	import PdfPage from '$lib/pages/pdf.svelte';
	import QrcodePage from '$lib/pages/qrcode.svelte';
	import TextDiffPage from '$lib/pages/text-diff.svelte';
	import HeatmapPage from '$lib/pages/heatmap.svelte';

	let { children } = $props();

	let isMacOS = $state(false);
	let appVersion = $state('v --');
	let updateState = $derived($updateInfo);

	onMount(() => {
		theme.init();
		applyPrimaryColor(appSettings.current.primaryColor);
		isMacOS = navigator.platform.toUpperCase().includes('MAC');
		void ensureCurrentVersionLoaded().then((version) => {
			appVersion = `v ${version}`;
		});
		if (appSettings.current.autoCheckUpdates) {
			void handleUpdateCheck({ silentError: true });
		}

		// 窗口尺寸和位置由 Rust 端在显示前恢复，前端只负责监听变化并保存
		const win = getCurrentWindow();

		// 监听窗口 resize，debounce 后保存尺寸
		let resizeTimer: ReturnType<typeof setTimeout>;
		const unlistenResize = win.onResized(({ payload: size }) => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				appSettings.saveWindowSize(size.width, size.height);
			}, 500);
		});

		// 监听窗口移动，debounce 后保存位置
		let moveTimer: ReturnType<typeof setTimeout>;
		const unlistenMove = win.onMoved(({ payload: pos }) => {
			clearTimeout(moveTimer);
			moveTimer = setTimeout(() => {
				appSettings.saveWindowPosition(pos.x, pos.y);
			}, 500);
		});

		return () => {
			unlistenResize.then((fn) => fn());
			unlistenMove.then((fn) => fn());
		};
	});

	const title = $derived($isLoading ? '悠然工具箱' : $_('app.title'));
	let settings = $derived(appSettings.current);
	let currentPath = $derived($page.url.pathname);

	// Keep-alive：记录已访问过的页面
	let visitedPages = $state<Record<string, boolean>>({});

	const keepAlivePages = ['/rename', '/classify-batch', '/image-compress', '/pdf', '/qrcode', '/text-diff', '/heatmap'];
	let isKeepAlivePage = $derived(keepAlivePages.includes(currentPath));

	$effect(() => {
		if (keepAlivePages.includes(currentPath) && !visitedPages[currentPath]) {
			visitedPages = { ...visitedPages, [currentPath]: true };
		}
	});

	function navigateTo(href: string) {
		goto(href, { replaceState: false, noScroll: true });
	}

	// 透明度：整个窗口背景跟随设置
	let rootBgStyle = $derived(
		settings.opacity < 100
			? `background-color: color-mix(in srgb, var(--color-background) ${settings.opacity}%, transparent)`
			: ''
	);

	$effect(() => {
		document.documentElement.style.background = 'transparent';
		document.body.style.background = 'transparent';
	});

	$effect(() => {
		if (updateState.currentVersion) {
			appVersion = `v ${updateState.currentVersion}`;
		}
	});

	// 设置面板
	let showSettings = $state(false);
	let showResetConfirm = $state(false);

	async function toggleWindowRemember() {
		const newMode = settings.windowSizeMode === 'remember' ? 'default' : 'remember';
		if (newMode === 'remember') {
			// 立即获取当前窗口尺寸和位置并保存
			const win = getCurrentWindow();
			const size = await win.innerSize();
			const pos = await win.outerPosition();
			appSettings.update({
				windowSizeMode: newMode,
				windowWidth: size.width,
				windowHeight: size.height,
				windowX: pos.x,
				windowY: pos.y
			});
		} else {
			appSettings.update({ windowSizeMode: newMode });
		}
	}

	function handleResetSettings() {
		showResetConfirm = true;
	}

	function confirmResetSettings() {
		appSettings.reset();
		showResetConfirm = false;
	}

	const features = [
		{
			titleKey: 'features.rename.title',
			icon: FileText,
			href: '/rename',
			color: 'blue'
		},
		{
			titleKey: 'features.classifyBatch.title',
			icon: Layers,
			href: '/classify-batch',
			color: 'purple'
		},
		{
			titleKey: 'features.imageCompress.title',
			icon: Image,
			href: '/image-compress',
			color: 'green'
		},
		{
			titleKey: 'features.pdf.title',
			icon: FileType,
			href: '/pdf',
			color: 'red'
		},
		{
			titleKey: 'features.qrcode.title',
			icon: QrCode,
			href: '/qrcode',
			color: 'amber'
		},
		{
			titleKey: 'features.textDiff.title',
			icon: GitCompare,
			href: '/text-diff',
			color: 'cyan'
		},
		{
			titleKey: 'features.heatmap.title',
			icon: Grid3x3,
			href: '/heatmap',
			color: 'orange'
		}
	];

	const iconBgColors: Record<string, string> = {
		blue: 'bg-blue-50 dark:bg-blue-950/40',
		purple: 'bg-purple-50 dark:bg-purple-950/40',
		green: 'bg-green-50 dark:bg-green-950/40',
		red: 'bg-red-50 dark:bg-red-950/40',
		amber: 'bg-amber-50 dark:bg-amber-950/40',
		cyan: 'bg-cyan-50 dark:bg-cyan-950/40',
		orange: 'bg-orange-50 dark:bg-orange-950/40'
	};

	const iconTextColors: Record<string, string> = {
		blue: 'text-blue-600 dark:text-blue-400',
		purple: 'text-purple-600 dark:text-purple-400',
		green: 'text-green-600 dark:text-green-400',
		red: 'text-red-600 dark:text-red-400',
		amber: 'text-amber-600 dark:text-amber-400',
		cyan: 'text-cyan-600 dark:text-cyan-400',
		orange: 'text-orange-600 dark:text-orange-400'
	};

	const activeBgColors: Record<string, string> = {
		blue: 'bg-blue-50 dark:bg-blue-950/30',
		purple: 'bg-purple-50 dark:bg-purple-950/30',
		green: 'bg-green-50 dark:bg-green-950/30',
		red: 'bg-red-50 dark:bg-red-950/30',
		amber: 'bg-amber-50 dark:bg-amber-950/30',
		cyan: 'bg-cyan-50 dark:bg-cyan-950/30',
		orange: 'bg-orange-50 dark:bg-orange-950/30'
	};

	let panelBgStyle = $derived(
		settings.opacity < 100
			? `background-color: color-mix(in srgb, var(--color-card) ${Math.min(settings.opacity + 10, 100)}%, transparent)`
			: ''
	);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if $isLoading}
	<div class="h-screen flex items-center justify-center">
		<div
			class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
		></div>
	</div>
{:else}
	<div
		class="h-screen flex flex-col overflow-hidden select-none bg-background relative"
		class:rounded-2xl={isMacOS}
		style={rootBgStyle}
	>
		<!-- 全局顶部拖拽条（绝对定位，跨越整个窗口宽度） -->
		<div class="absolute top-0 left-0 right-0 h-10 z-40 pointer-events-none">
			<div class="h-full flex items-center">
				<!-- macOS：侧边栏宽度留空，右侧可拖拽 -->
				{#if isMacOS}
					<div class="w-60 shrink-0"></div>
					<div class="flex-1 h-full pointer-events-auto" data-tauri-drag-region></div>
				{:else}
					<div class="flex-1 h-full pointer-events-auto" data-tauri-drag-region></div>
					<div class="pointer-events-auto h-full">
						<Titlebar />
					</div>
				{/if}
			</div>
		</div>

		<div class="flex flex-1 overflow-hidden">
			<!-- 左侧侧边栏（悬浮圆角面板） -->
			<div class="p-2 pr-0 shrink-0 z-10">
				<aside
					class="w-56 h-full flex flex-col rounded-xl bg-card/80 backdrop-blur-md border border-border/30 shadow-sm"
					style={panelBgStyle}
				>
					<!-- macOS 红绿黄在侧边栏顶部 -->
					{#if isMacOS}
						<div class="shrink-0 pt-3 pl-3.5" data-tauri-drag-region>
							<Titlebar />
						</div>
					{/if}

					<!-- Logo -->
					<div class="px-5 pb-2 pt-4">
						<button onclick={() => navigateTo('/')} class="flex items-center gap-2.5">
							<img src="/logo.png" alt="" class="w-7 h-7 rounded-lg" />
							<span class="font-semibold text-foreground text-sm">{$_('app.title')}</span>
						</button>
					</div>

				<!-- 功能列表 -->
				<nav class="flex-1 px-2 py-2 overflow-y-auto">
					<div class="flex flex-col gap-0.5">
						{#each features as feature}
							{@const isActive = currentPath === feature.href}
							<button
								onclick={() => navigateTo(feature.href)}
								class="group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left
									{isActive
									? activeBgColors[feature.color]
									: 'hover:bg-accent/50'}"
							>
								<div
									class="w-7 h-7 rounded-md flex items-center justify-center shrink-0 {iconBgColors[
										feature.color
									]}"
								>
									<feature.icon
										class="w-3.5 h-3.5 {iconTextColors[feature.color]}"
									/>
								</div>
								<span
									class="text-sm {isActive
										? 'font-medium text-foreground'
										: 'text-muted-foreground group-hover:text-foreground transition-colors'}"
								>
									{$_(feature.titleKey)}
								</span>
							</button>
						{/each}
					</div>
				</nav>

				<!-- 底部控件 -->
				<div class="px-2 py-2.5 border-t border-border/30 flex items-center gap-0.5">
				<Popover.Root
					open={showSettings}
					onOpenChange={(open) => {
						showSettings = open;
						if (!open) showResetConfirm = false;
					}}
				>
					<Popover.Trigger
						class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
						title={$_('settings.title')}
						aria-label={$_('settings.title')}
					>
						<Settings class="w-4 h-4" />
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							side="top"
							align="start"
							sideOffset={8}
							class="z-50 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none"
							data-tooltip-boundary
						>
							<div class="max-h-[70vh] overflow-y-auto p-4 space-y-4">
								<div>
									<p class="mb-2 text-sm font-medium text-foreground">{$_('settings.primaryColor')}</p>
									<ToggleGroup.Root
										type="single"
										value={settings.primaryColor}
										onValueChange={(nextColor) => appSettings.update({ primaryColor: nextColor })}
										class="grid grid-cols-8 gap-2"
									>
										{#each colorOptions as opt}
											<ToggleGroup.Item
												value={opt.value}
												aria-label={$_(`settings.color_${opt.value}`)}
												title={$_(`settings.color_${opt.value}`)}
												class="h-5 w-5 rounded-full border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=on]:scale-110 data-[state=on]:border-foreground data-[state=on]:shadow-md data-[state=off]:border-transparent"
												style="background-color: {opt.preview}"
											></ToggleGroup.Item>
										{/each}
									</ToggleGroup.Root>
								</div>

								<div class="space-y-3">
									<p class="text-sm font-medium text-foreground">{$_('settings.visualEffects')}</p>

									<div class="space-y-1.5">
										<div class="flex items-center justify-between">
											<span class="text-xs text-muted-foreground">{$_('settings.opacity')}</span>
											<span class="text-[10px] text-muted-foreground">{settings.opacity}%</span>
										</div>
										<Slider
											value={settings.opacity}
											min={50}
											max={100}
											step={1}
											onchange={(nextOpacity) => appSettings.update({ opacity: nextOpacity })}
										/>
									</div>

									<div class="flex items-center justify-between">
										<span class="text-xs text-muted-foreground">{$_('settings.contentFullWidth')}</span>
										<Switch
											size="sm"
											checked={settings.contentFullWidth}
											ariaLabel={$_('settings.contentFullWidth')}
											onchange={() => appSettings.update({ contentFullWidth: !settings.contentFullWidth })}
										/>
									</div>

									<div class="flex items-start justify-between gap-2">
										<span class="inline-flex min-w-0 items-start gap-1 text-xs text-muted-foreground">
											<span class="leading-4 break-words">{$_('settings.windowSize')}</span>
											<HintIcon
												text={$_('settings.windowSizeHint')}
												position="top"
												tooltipMinWidth="160px"
												tooltipMaxWidth="260px"
											/>
										</span>
										<Switch
											size="sm"
											checked={settings.windowSizeMode === 'remember'}
											ariaLabel={$_('settings.windowSize')}
											onchange={toggleWindowRemember}
										/>
									</div>
								</div>

								<div class="space-y-3 border-t border-border/40 pt-3">
									<p class="text-sm font-medium text-foreground">{$_('settings.updates')}</p>

									<div class="flex items-start justify-between gap-2">
										<div class="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
											<span class="leading-4 break-words">{$_('settings.autoCheckUpdates')}</span>
											<HintIcon
												text={$_('settings.autoCheckUpdatesHint')}
												position="top"
												tooltipMinWidth="160px"
												tooltipMaxWidth="260px"
											/>
										</div>
										<Switch
											size="sm"
											checked={settings.autoCheckUpdates}
											ariaLabel={$_('settings.autoCheckUpdates')}
											onchange={() =>
												appSettings.update({ autoCheckUpdates: !settings.autoCheckUpdates })}
										/>
									</div>

									<Button
										variant="outline"
										class="w-full"
										onclick={() => handleUpdateCheck({ showNoUpdateMessage: true })}
										disabled={updateState.checking}
									>
										{updateState.checking
											? $_('settings.checkingUpdates')
											: $_('settings.checkUpdates')}
									</Button>
								</div>

								<div class="flex items-center justify-between border-t border-border/40 pt-2">
									<button
										class="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
										onclick={handleResetSettings}
										title={$_('settings.reset')}
										aria-label={$_('settings.reset')}
									>
										<RotateCcw class="w-3.5 h-3.5" />
									</button>
									<p class="text-[11px] text-muted-foreground">{appVersion}</p>
								</div>
							</div>
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
				<LocaleSwitcher title={$_('settings.language')} />
				<ThemeToggle mode={theme.mode} onToggle={theme.toggle} title={$_('settings.themeMode')} />
			</div>

			<AlertDialog.Root open={showResetConfirm} onOpenChange={(open) => (showResetConfirm = open)}>
				<AlertDialog.Portal>
					<AlertDialog.Overlay class="fixed inset-0 z-40 bg-background/75 backdrop-blur-sm" />
					<AlertDialog.Content
						class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-4 shadow-xl outline-none"
					>
						<div class="space-y-2">
							<AlertDialog.Title class="text-sm font-medium text-foreground">
								{$_('settings.reset')}
							</AlertDialog.Title>
							<AlertDialog.Description class="text-xs leading-5 text-muted-foreground">
								{$_('settings.resetConfirm')}
							</AlertDialog.Description>
						</div>
						<div class="flex items-center justify-end gap-2 pt-4">
							<AlertDialog.Cancel class="inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
								{$_('rename.cancel')}
							</AlertDialog.Cancel>
							<AlertDialog.Action
								class="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
								onclick={confirmResetSettings}
							>
								{$_('rename.confirm')}
							</AlertDialog.Action>
						</div>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
			</aside>
		</div>

		<!-- 右侧内容区 -->
		<main class="flex-1 flex flex-col overflow-hidden relative" data-content-full-width={settings.contentFullWidth || null}>
			<!-- 顶部占位（拖拽区域由全局拖拽条覆盖） -->
			<div class="h-10 w-full shrink-0"></div>

			<div class="flex-1 overflow-y-auto">
				<Toast />

				<!-- Keep-alive 页面 -->
				{#if visitedPages['/rename']}
					<div class:hidden={currentPath !== '/rename'}><RenamePage /></div>
				{/if}
				{#if visitedPages['/classify-batch']}
					<div class:hidden={currentPath !== '/classify-batch'}><ClassifyBatchPage /></div>
				{/if}
				{#if visitedPages['/image-compress']}
					<div class:hidden={currentPath !== '/image-compress'}><ImageCompressPage /></div>
				{/if}
				{#if visitedPages['/pdf']}
					<div class:hidden={currentPath !== '/pdf'}><PdfPage /></div>
				{/if}
				{#if visitedPages['/qrcode']}
					<div class:hidden={currentPath !== '/qrcode'}><QrcodePage /></div>
				{/if}
				{#if visitedPages['/text-diff']}
					<div class:hidden={currentPath !== '/text-diff'}><TextDiffPage /></div>
				{/if}
				{#if visitedPages['/heatmap']}
					<div class:hidden={currentPath !== '/heatmap'}><HeatmapPage /></div>
				{/if}

				<!-- 非 keep-alive 页面（首页、设置等） -->
				{#if !isKeepAlivePage}
					{@render children()}
				{/if}
			</div>
		</main>
	</div>
	</div>
{/if}
