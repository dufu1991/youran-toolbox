<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { openUrl } from '@tauri-apps/plugin-opener';

	const quickLinks = [
		{ labelKey: 'app.website', url: 'https://youran-toolbox.du-fu.com', isWebsite: true },
		{ labelKey: 'app.guide', url: 'https://youran-toolbox.du-fu.com/#guide', isGuide: true },
		{ labelKey: 'app.changelog', url: 'https://youran-toolbox.du-fu.com/#changelog', isChangelog: true }
	];
</script>

<div class="h-full flex flex-col items-center justify-center px-8">
	<img src="/logo.png" alt="Logo" class="w-20 h-20 mb-6 drop-shadow-lg" />
	<h1 class="text-3xl font-bold text-foreground mb-3">{$_('app.title')}</h1>
	<p class="text-base text-muted-foreground text-center">{$_('app.subtitle')}</p>
	<p class="text-sm text-muted-foreground/50 mt-3">{$_('app.moreFeatures')}</p>
	<div class="mt-5 flex flex-wrap items-center justify-center gap-2">
		{#each quickLinks as link}
			<button
				class="inline-flex items-center gap-1.5 rounded-md border border-border/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
				onclick={() => openUrl(link.url)}
			>
				{#if link.isWebsite}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3 shrink-0"
					>
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
				{/if}
				{#if link.isGuide}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3 shrink-0"
					>
						<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
						<path d="M8 11h8" />
						<path d="M8 7h6" />
					</svg>
				{/if}
				{#if link.isChangelog}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3 shrink-0"
					>
						<path d="M15 12h-5" />
						<path d="M15 8h-5" />
						<path d="M19 17V5a2 2 0 0 0-2-2H4" />
						<path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
					</svg>
				{/if}
				{$_(link.labelKey)}
			</button>
		{/each}
	</div>
</div>
