<script lang="ts">
	import { onMount } from 'svelte';
	import { locale, setLocale, getAvailableLocales } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import { Languages } from 'lucide-svelte';

	let locales: { code: string; name: string; flag: string }[] = $state([]);
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
	<Button variant="ghost" size="icon" onclick={toggleDropdown} class="w-9 h-9">
		<Languages class="w-5 h-5" />
	</Button>

	{#if showDropdown}
		<div class="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg py-1 min-w-32 z-50">
			{#each locales as loc}
				<button
					class="w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors flex items-center gap-2 {loc.code === currentLocale ? 'bg-accent' : ''}"
					onclick={() => handleSelect(loc.code)}
				>
					<span>{loc.flag}</span>
					<span>{loc.name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
