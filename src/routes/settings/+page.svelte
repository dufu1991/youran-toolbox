<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { RotateCcw } from 'lucide-svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { Slider } from '$lib/components/ui/slider';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { appSettings, colorOptions } from '$lib/stores/settings.svelte';
	import { handleUpdateCheck, updateInfo } from '$lib/services/update';

	let settings = $derived(appSettings.current);
	let updateState = $derived($updateInfo);
</script>

<div class="px-6 py-8 max-w-3xl mx-auto">
		<header class="mb-8">
			<h1 class="text-2xl font-bold text-foreground">{$_('settings.title')}</h1>
			<p class="text-muted-foreground mt-1">{$_('settings.desc')}</p>
		</header>

		<!-- 主题色 -->
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="text-base">{$_('settings.primaryColor')}</Card.Title>
				<Card.Description>{$_('settings.primaryColorDesc')}</Card.Description>
			</Card.Header>
			<Card.Content>
				<ToggleGroup.Root
					type="single"
					value={settings.primaryColor}
					onValueChange={(nextColor) => appSettings.update({ primaryColor: nextColor })}
					class="flex flex-wrap gap-3"
				>
					{#each colorOptions as opt}
						<ToggleGroup.Item
							value={opt.value}
							aria-label={$_(`settings.color_${opt.value}`)}
							title={$_(`settings.color_${opt.value}`)}
							class="h-10 w-10 rounded-full border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=on]:scale-110 data-[state=on]:border-foreground data-[state=on]:shadow-md data-[state=off]:border-transparent"
							style="background-color: {opt.preview}"
						></ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</Card.Content>
		</Card.Root>

		<!-- 视觉效果 -->
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="text-base">{$_('settings.visualEffects')}</Card.Title>
				<Card.Description>{$_('settings.visualEffectsDesc')}</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5">
				<!-- 背景透明度 -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-foreground">{$_('settings.opacity')}</p>
							<p class="text-xs text-muted-foreground mt-0.5">
								{$_('settings.opacityHint')}
							</p>
						</div>
						<span class="text-xs text-muted-foreground">{settings.opacity}%</span>
					</div>
					<Slider
						value={settings.opacity}
						min={50}
						max={100}
						step={1}
						onchange={(nextOpacity) => appSettings.update({ opacity: nextOpacity })}
					/>
				</div>

				<!-- 内容区全宽 -->
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-foreground">{$_('settings.contentFullWidth')}</p>
						<p class="text-xs text-muted-foreground mt-0.5">
							{$_('settings.contentFullWidthHint')}
						</p>
					</div>
					<Switch checked={settings.contentFullWidth} onchange={() => appSettings.update({ contentFullWidth: !settings.contentFullWidth })} />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 更新 -->
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="text-base">{$_('settings.updates')}</Card.Title>
				<Card.Description>{$_('settings.updatesDesc')}</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5">
				<div class="flex items-center justify-between gap-3">
					<div class="inline-flex min-w-0 items-center gap-1.5">
						<p class="text-sm font-medium text-foreground">{$_('settings.autoCheckUpdates')}</p>
						<HintIcon
							text={$_('settings.autoCheckUpdatesHint')}
							position="top"
							tooltipMinWidth="160px"
							tooltipMaxWidth="260px"
						/>
					</div>
					<Switch
						checked={settings.autoCheckUpdates}
						onchange={() =>
							appSettings.update({ autoCheckUpdates: !settings.autoCheckUpdates })}
					/>
				</div>

				<div class="flex items-center justify-between gap-3">
					<div class="min-w-0">
						<p class="text-sm font-medium text-foreground">{$_('settings.checkUpdates')}</p>
						{#if updateState.error}
							<p class="mt-0.5 text-xs text-destructive">{updateState.error}</p>
						{/if}
					</div>
					<Button
						onclick={() => handleUpdateCheck({ showNoUpdateMessage: true })}
						disabled={updateState.checking}
					>
						{updateState.checking
							? $_('settings.checkingUpdates')
							: $_('settings.checkUpdates')}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 重置 -->
		<div class="flex justify-end">
			<Button variant="outline" onclick={() => appSettings.reset()}>
				<RotateCcw class="w-4 h-4 mr-2" />
				{$_('settings.reset')}
			</Button>
		</div>
	</div>
