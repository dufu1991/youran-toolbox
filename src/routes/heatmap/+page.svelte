<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { toast } from '$lib/components/ui/toast';
	import { ChevronLeft, Trash2, Download, ArrowRightLeft } from 'lucide-svelte';
	import { toPng } from 'html-to-image';
	import { save } from '@tauri-apps/plugin-dialog';
	import { writeFile } from '@tauri-apps/plugin-fs';

	interface HeatmapData {
		xLabels: string[];
		yLabels: string[];
		matrix: number[][];
		min: number;
		max: number;
	}

	interface ColorScheme {
		name: string;
		colors: string[];
	}

	const colorSchemes: ColorScheme[] = [
		{ name: 'purple', colors: ['#f3e8ff', '#d8b4fe', '#a855f7', '#7e22ce', '#581c87'] },
		{ name: 'blue', colors: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'] },
		{ name: 'green', colors: ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'] },
		{ name: 'red', colors: ['#fee2e2', '#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'] },
		{ name: 'orange', colors: ['#ffedd5', '#fdba74', '#f97316', '#c2410c', '#7c2d12'] },
		{ name: 'teal', colors: ['#ccfbf1', '#5eead4', '#14b8a6', '#0f766e', '#134e4a'] },
		{ name: 'pink', colors: ['#fce7f3', '#f9a8d4', '#ec4899', '#be185d', '#831843'] },
		{ name: 'indigo', colors: ['#e0e7ff', '#a5b4fc', '#6366f1', '#4338ca', '#312e81'] },
		{ name: 'amber', colors: ['#fef3c7', '#fcd34d', '#f59e0b', '#b45309', '#78350f'] },
		{ name: 'cyan', colors: ['#cffafe', '#67e8f9', '#06b6d4', '#0e7490', '#164e63'] }
	];


	let yLabels: string[] = $state([]);
	let xLabels: string[] = $state([]);
	let matrix: string[][] = $state([]);
	let hasData: boolean = $state(false);

	let selectedScheme: number = $state(0);
	let useCustomColor: boolean = $state(false);
	let customColor: string = $state('#3b82f6');
	let title: string = $state('');
	let xAxisTitle: string = $state('');
	let yAxisTitle: string = $state('');
	let cellSize: number = $state(48);
	let cellHeight: number = $state(32);
	let cellGap: number = $state(1);
	let xLabelAngle: number = $state(-45);
	let axisSwapped: boolean = $state(false);
	let legendTitle: string = $state('');
	let pixelRatio: number = $state(2);
	let exportPadding: number = $state(20);
	let heatmapContainer: HTMLDivElement | undefined = $state(undefined);

	function handlePaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text/plain') || '';
		if (!text.trim()) return;
		e.preventDefault();

		const lines = text.trim().split('\n').filter((line) => line.trim());
		if (lines.length < 2) return;

		const headerCells = lines[0].split('\t');
		const parsedYLabels = headerCells.slice(1).map((s) => s.trim()).filter((s) => s);
		if (parsedYLabels.length === 0) return;

		const parsedXLabels: string[] = [];
		const parsedMatrix: string[][] = [];

		for (let i = 1; i < lines.length; i++) {
			const cells = lines[i].split('\t');
			const label = cells[0]?.trim() || '';
			if (!label) continue;
			parsedXLabels.push(label);

			const row: string[] = [];
			for (let j = 1; j <= parsedYLabels.length; j++) {
				row.push(cells[j]?.trim() || '0');
			}
			while (row.length < parsedYLabels.length) {
				row.push('0');
			}
			parsedMatrix.push(row);
		}

		if (parsedXLabels.length === 0) return;

		yLabels = parsedYLabels;
		xLabels = parsedXLabels;
		matrix = parsedMatrix;
		hasData = true;
	}

	const heatmapData: HeatmapData | null = $derived.by(() => {
		if (!hasData || xLabels.length === 0 || yLabels.length === 0) return null;

		let min = Infinity;
		let max = -Infinity;
		const numMatrix: number[][] = [];

		for (let i = 0; i < matrix.length; i++) {
			const row: number[] = [];
			for (let j = 0; j < matrix[i].length; j++) {
				const val = parseFloat(matrix[i][j] || '0');
				const num = isNaN(val) ? 0 : val;
				row.push(num);
				// 0 不参与 min/max 计算（0 为透明）
				if (num !== 0) {
					if (num < min) min = num;
					if (num > max) max = num;
				}
			}
			numMatrix.push(row);
		}

		if (min === Infinity) min = 0;
		if (max === -Infinity) max = 0;

		if (axisSwapped) {
			// 转置矩阵
			const transposed: number[][] = [];
			for (let j = 0; j < numMatrix[0].length; j++) {
				const row: number[] = [];
				for (let i = 0; i < numMatrix.length; i++) {
					row.push(numMatrix[i][j]);
				}
				transposed.push(row);
			}
			return { xLabels: [...yLabels], yLabels: [...xLabels], matrix: transposed, min, max };
		}

		return { xLabels: [...xLabels], yLabels: [...yLabels], matrix: numMatrix, min, max };
	});

	function hexToRgb(hex: string): { r: number; g: number; b: number } {
		const h = hex.replace('#', '');
		const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
		return {
			r: parseInt(full.substring(0, 2), 16),
			g: parseInt(full.substring(2, 4), 16),
			b: parseInt(full.substring(4, 6), 16)
		};
	}

	function getColor(value: number, min: number, max: number, scheme: ColorScheme): string {
		if (value === 0) return 'transparent';
		const baseColor = useCustomColor ? customColor : scheme.colors[3];
		const { r, g, b } = hexToRgb(baseColor);
		if (max === min) return `rgba(${r}, ${g}, ${b}, 0.5)`;
		const alpha = 0.15 + ((value - min) / (max - min)) * 0.85;
		return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(4)})`;
	}

	function getTextColor(value: number, bgColor: string): string {
		if (value === 0) return '#94a3b8';
		const baseColor = useCustomColor ? customColor : colorSchemes[selectedScheme].colors[3];
		const { r, g, b } = hexToRgb(baseColor);
		const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
		const alpha = match ? parseFloat(match[4] || '1') : 1;
		const blendedR = r * alpha + 255 * (1 - alpha);
		const blendedG = g * alpha + 255 * (1 - alpha);
		const blendedB = b * alpha + 255 * (1 - alpha);
		const luminance = (0.299 * blendedR + 0.587 * blendedG + 0.114 * blendedB) / 255;
		return luminance > 0.5 ? '#1e293b' : '#ffffff';
	}

	const legendGradient = $derived.by(() => {
		const baseColor = useCustomColor ? customColor : colorSchemes[selectedScheme].colors[3];
		const { r, g, b } = hexToRgb(baseColor);
		return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.15), rgba(${r}, ${g}, ${b}, 1))`;
	});

	function getNiceTicks(min: number, max: number): number[] {
		if (max <= min) return [0];
		const range = max - min;
		const roughStep = range / 5;
		const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
		const normalized = roughStep / mag;
		let niceStep: number;
		if (normalized <= 1) niceStep = 1 * mag;
		else if (normalized <= 2) niceStep = 2 * mag;
		else if (normalized <= 5) niceStep = 5 * mag;
		else niceStep = 10 * mag;

		const ticks: number[] = [0];
		const start = Math.ceil(min / niceStep) * niceStep;
		for (let v = start; v < max - niceStep * 0.01; v += niceStep) {
			const rounded = Math.round(v * 1000) / 1000;
			if (rounded > 0) ticks.push(rounded);
		}
		return ticks;
	}

	const legendTicks = $derived.by(() => {
		if (!heatmapData) return [];
		return getNiceTicks(heatmapData.min, heatmapData.max);
	});

	function clear() {
		yLabels = [];
		xLabels = [];
		matrix = [];
		hasData = false;
		title = '';
		xAxisTitle = '';
		yAxisTitle = '';
		legendTitle = '';
	}

	async function exportImage() {
		if (!heatmapContainer) return;
		const dataUrl = await toPng(heatmapContainer, {
			backgroundColor: '#ffffff',
			pixelRatio: pixelRatio
		});

		const base64 = dataUrl.split(',')[1];
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		const filePath = await save({
			defaultPath: 'heatmap.png',
			filters: [{ name: 'PNG', extensions: ['png'] }]
		});

		if (filePath) {
			await writeFile(filePath, bytes);
			toast.success($_('heatmap.exportSuccess'));
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
	<div class="container mx-auto px-6 py-8">
		<header class="mb-8">
			<a href="/" class="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
				<ChevronLeft class="w-4 h-4" />
				{$_('nav.backHome')}
			</a>
			<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
				{$_('features.heatmap.title')}
			</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">
				{$_('features.heatmap.desc')}
			</p>
		</header>

		<!-- 数据输入 -->
		<Card.Root class="mb-6">
			<Card.Header class="pb-2">
				<div class="flex items-center gap-2">
					<Card.Title class="text-base">{$_('heatmap.inputData')}</Card.Title>
					<HintIcon text={$_('heatmap.inputHint')} />
					{#if hasData}
						<Button variant="outline" size="sm" class="ml-auto" onclick={clear}>
							<Trash2 class="w-4 h-4 mr-1" />
							{$_('heatmap.clear')}
						</Button>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if !hasData}
					<div
						class="w-full h-40 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 cursor-text"
						role="textbox"
						tabindex="0"
						onpaste={handlePaste}
						onkeydown={(e) => {
							if (e.key === 'v' && (e.metaKey || e.ctrlKey)) return;
							e.preventDefault();
						}}
					>
						<p class="text-sm text-slate-400 dark:text-slate-500">
							{$_('heatmap.inputPlaceholder')}
						</p>
					</div>
				{:else}
					<div class="overflow-auto max-h-80">
						<table class="border-collapse text-sm w-full">
							<thead>
								<tr>
									<th class="sticky left-0 z-10 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 min-w-20"></th>
									{#each yLabels as _, yi}
										<th class="border border-slate-200 dark:border-slate-600 p-0 min-w-20 bg-slate-50 dark:bg-slate-800">
											<input type="text" class="w-full px-2 py-1 text-center text-sm font-medium bg-transparent outline-none" bind:value={yLabels[yi]} />
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each xLabels as _, xi}
									<tr>
										<td class="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-0 min-w-20">
											<input type="text" class="w-full px-2 py-1 text-sm font-medium bg-transparent outline-none" bind:value={xLabels[xi]} />
										</td>
										{#each matrix[xi] as _, yi}
											<td class="border border-slate-200 dark:border-slate-600 p-0 min-w-20">
												<input type="text" class="w-full px-2 py-1 text-center text-sm bg-transparent outline-none" bind:value={matrix[xi][yi]} />
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- 图形配置（数据表格和热力图之间） -->
		{#if hasData}
			<div class="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.colorScheme')}</span>
					<div class="flex gap-1 flex-wrap items-center">
						{#each colorSchemes as scheme, i}
							<button
								class="w-6 h-6 rounded transition-all {!useCustomColor && selectedScheme === i
									? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500 scale-110'
									: 'hover:scale-110'}"
								style="background: {scheme.colors[3]}"
								onclick={() => { useCustomColor = false; selectedScheme = i; }}
								title={$_(`heatmap.color.${scheme.name}`)}
							></button>
						{/each}
						<span class="text-slate-300 dark:text-slate-600 mx-1">|</span>
						<label
							class="relative w-6 h-6 rounded overflow-hidden transition-all border border-slate-300 dark:border-slate-500 cursor-pointer {useCustomColor
								? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500 scale-110'
								: 'hover:scale-110'}"
							style="background: {customColor}"
							title={$_('heatmap.customColor')}
						>
							<input
								type="color"
								class="absolute inset-0 w-full h-full cursor-pointer opacity-0"
								bind:value={customColor}
								oninput={() => { useCustomColor = true; }}
								onclick={() => { useCustomColor = true; }}
							/>
						</label>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.swapAxis')}</span>
					<Button variant="outline" size="sm" onclick={() => (axisSwapped = !axisSwapped)}>
						<ArrowRightLeft class="w-4 h-4 mr-1" />
						{$_('heatmap.swapAxisBtn')}
					</Button>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.chartTitle')}</span>
					<input type="text" class="h-8 px-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-40" placeholder={$_('heatmap.titlePlaceholder')} bind:value={title} />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.xAxisTitleLabel')}</span>
					<input type="text" class="h-8 px-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-32" placeholder={$_('heatmap.xAxisTitlePlaceholder')} bind:value={xAxisTitle} />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.yAxisTitleLabel')}</span>
					<input type="text" class="h-8 px-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-32" placeholder={$_('heatmap.yAxisTitlePlaceholder')} bind:value={yAxisTitle} />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.legendTitleLabel')}</span>
					<input type="text" class="h-8 px-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-32" placeholder={$_('heatmap.legendTitlePlaceholder')} bind:value={legendTitle} />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.cellWidth')}</span>
					<input type="range" min="28" max="80" step="2" class="w-20 accent-primary" bind:value={cellSize} />
					<span class="text-xs text-slate-400 w-6">{cellSize}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.cellHeight')}</span>
					<input type="range" min="20" max="60" step="2" class="w-20 accent-primary" bind:value={cellHeight} />
					<span class="text-xs text-slate-400 w-6">{cellHeight}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.cellGap')}</span>
					<div class="flex">
						{#each [0, 1, 2, 3, 4] as gap, i}
							<button
								class="px-2 py-1 text-xs border transition-all {cellGap === gap ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 4 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
								onclick={() => (cellGap = gap)}
							>{gap}</button>
						{/each}
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.xLabelAngle')}</span>
					<div class="flex">
						{#each [-90, -82.5, -75, -67.5, -60, -52.5, -45, -37.5, -30, -22.5, -15] as angle, i}
							<button
								class="px-1.5 py-1 text-xs border transition-all {xLabelAngle === angle ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 10 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
								onclick={() => (xLabelAngle = angle)}
							>{angle}°</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- 热力图 -->
		{#if heatmapData}
			<Card.Root>
				<Card.Content class="p-6">
					<div bind:this={heatmapContainer} class="inline-block" style="padding: {exportPadding}px">
						{#if title}
							<h3 class="text-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
								{title}
							</h3>
						{/if}

						<div class="flex gap-4">
							<!-- Y 轴标题 -->
							{#if yAxisTitle}
								<div class="flex items-center flex-shrink-0">
									<span class="heatmap-y-axis-title font-bold text-sm text-slate-700 dark:text-slate-300">
										{yAxisTitle}
									</span>
								</div>
							{/if}

							<!-- 热力图主体 -->
							<div class="flex-1">
								<table style="border-spacing: {cellGap}px; border-collapse: separate">
									<tbody>
										{#each heatmapData.yLabels as yLabel, yi}
											<tr>
												<td class="pr-2 py-0 text-xs text-slate-600 dark:text-slate-400 text-right whitespace-nowrap">
													{yLabel}
												</td>
												{#each heatmapData.xLabels as _, xi}
													{@const value = heatmapData.matrix[xi][yi]}
													{@const bgColor = getColor(value, heatmapData.min, heatmapData.max, colorSchemes[selectedScheme])}
													<td
														class="text-center text-xs"
														style="background-color: {bgColor}; color: {getTextColor(value, bgColor)}; width: {cellSize}px; height: {cellHeight}px"
													>
														{value}
													</td>
												{/each}
											</tr>
										{/each}
									</tbody>
									<tfoot>
										<tr>
											<td></td>
											{#each heatmapData.xLabels as xLabel}
												<td class="pt-2 text-xs text-slate-600 dark:text-slate-400 text-center align-top" style="width: {cellSize}px; position: relative; overflow: visible; height: 80px">
													<div class="x-label" style="transform: rotate({xLabelAngle}deg)">{xLabel}</div>
												</td>
											{/each}
										</tr>
									</tfoot>
								</table>

								{#if xAxisTitle}
									<div class="text-center mt-3">
										<span class="font-bold text-sm text-slate-700 dark:text-slate-300">{xAxisTitle}</span>
									</div>
								{/if}
							</div>

							<!-- 图例 -->
							<div class="flex flex-col flex-shrink-0 ml-4 items-center justify-center">
								{#if legendTitle}
									<span class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3">{legendTitle}</span>
								{/if}
								<div class="flex">
									<div class="relative w-4" style="height: 100px">
										<div class="w-full h-full" style="background: {legendGradient}"></div>
									{#each legendTicks as tick}
										{@const pos = heatmapData.max === 0 ? 50 : (1 - tick / heatmapData.max) * 100}
										<div class="absolute left-full" style="top: {pos}%; transform: translateY(-50%)">
											<div class="flex items-center">
												<div class="w-1.5 h-px bg-slate-400"></div>
												<span class="text-xs text-slate-500 dark:text-slate-400 ml-1 whitespace-nowrap">{tick}</span>
											</div>
										</div>
									{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- 导出按钮 -->
			<div class="flex justify-end items-center gap-3 mt-4">
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.exportPadding')}</span>
					<input type="range" min="0" max="60" step="5" class="w-20 accent-primary" bind:value={exportPadding} />
					<span class="text-xs text-slate-400 w-6">{exportPadding}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">{$_('heatmap.exportScale')}</span>
					<HintIcon text={$_('heatmap.exportScaleHint')} />
					<div class="flex">
						{#each [1, 2, 3] as scale, i}
							<button
								class="px-2 py-1 text-xs border transition-all {pixelRatio === scale ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 2 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
								onclick={() => (pixelRatio = scale)}
							>{scale}x</button>
						{/each}
					</div>
				</div>
				<Button variant="outline" size="sm" onclick={exportImage}>
					<Download class="w-4 h-4 mr-1" />
					{$_('heatmap.export')}
				</Button>
			</div>
		{/if}
	</div>
</div>

<style>
	.heatmap-y-axis-title {
		white-space: nowrap;
		letter-spacing: 0.05em;
		transform: rotate(-90deg);
	}

	.x-label {
		white-space: nowrap;
		display: inline-block;
		position: absolute;
		right: 50%;
		top: 8px;
		transform-origin: top right;
	}
</style>