<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { RotateCcw } from 'lucide-svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { appSettings, colorOptions } from '$lib/stores/settings.svelte';

	let settings = $derived(appSettings.current);
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
				<div class="flex gap-3 flex-wrap">
					{#each colorOptions as opt}
						<button
							class="w-10 h-10 rounded-full border-2 transition-all hover:scale-110 {settings.primaryColor ===
							opt.value
								? 'border-foreground scale-110 shadow-md'
								: 'border-transparent'}"
							style="background-color: {opt.preview}"
							onclick={() => appSettings.update({ primaryColor: opt.value })}
							title={$_(`settings.color_${opt.value}`)}
						></button>
					{/each}
				</div>
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
					<input
						type="range"
						min="50"
						max="100"
						step="1"
						value={settings.opacity}
						oninput={(e) => appSettings.update({ opacity: Number(e.currentTarget.value) })}
						class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
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

		<!-- 重置 -->
		<div class="flex justify-end">
			<Button variant="outline" onclick={() => appSettings.reset()}>
				<RotateCcw class="w-4 h-4 mr-2" />
				{$_('settings.reset')}
			</Button>
		</div>
	</div>
