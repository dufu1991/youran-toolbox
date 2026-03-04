<script lang="ts">
	import { onMount } from 'svelte';
	import { locale, setLocale, getAvailableLocales } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import { Globe } from 'lucide-svelte';

	let { title = '' }: { title?: string } = $props();

	let locales: { code: string; name: string }[] = $state([]);
	let showDropdown = $state(false);
	let currentLocale = $state('zh-CN');

	onMount(async () => {
		locales = await getAvailableLocales();
	});

	$effect(() => {
		const unsubscribe = locale.subscribe((value) => {
			if (value) currentLocale = value;
		});
		return unsubscribe;
	});

	function handleSelect(code: string) {
		setLocale(code);
		showDropdown = false;
	}

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.locale-switcher')) {
			showDropdown = false;
		}
	}

	$effect(() => {
		if (showDropdown) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="locale-switcher relative">
	<Button variant="ghost" size="icon" onclick={toggleDropdown} class="w-9 h-9" {title}>
		<Globe class="w-5 h-5" />
	</Button>

	{#if showDropdown}
		<div class="absolute left-0 bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg p-1 min-w-36 z-50 flex flex-col gap-0.5">
			{#each locales as loc}
				<button
					class="w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors {loc.code === currentLocale ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}"
					onclick={() => handleSelect(loc.code)}
				>
					{loc.name}
				</button>
			{/each}
		</div>
	{/if}
</div>
