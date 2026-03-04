<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import { ThemeToggle } from '$lib/components/ui/theme-toggle';
	import { LocaleSwitcher } from '$lib/components/ui/locale-switcher';
	import { ChevronLeft, Settings } from 'lucide-svelte';
	import { appSettings, theme } from '$lib/stores/settings.svelte';
	import { page } from '$app/stores';

	let isSettings = $derived($page.url.pathname === '/settings');
</script>

<nav class="sticky top-0 z-50 border-b border-border/50">
	<div class="container mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ChevronLeft class="w-4 h-4" />
				{$_('nav.backHome')}
			</a>
		</div>

		<div class="flex items-center gap-1">
			<LocaleSwitcher />
			<ThemeToggle mode={theme.mode} onToggle={theme.toggle} />
			{#if !isSettings}
				<a href="/settings">
					<Button variant="ghost" size="icon" class="w-9 h-9">
						<Settings class="w-5 h-5" />
					</Button>
				</a>
			{/if}
		</div>
	</div>
</nav>
