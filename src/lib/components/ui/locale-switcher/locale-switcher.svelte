<script lang="ts">
	import { onMount } from 'svelte';
	import { locale, setLocale, getAvailableLocales } from '$lib/i18n';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Globe } from 'lucide-svelte';

	let { title = '' }: { title?: string } = $props();

	let locales: { code: string; name: string }[] = $state([]);
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
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
		{title}
		aria-label={title}
	>
		<Globe class="w-5 h-5" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content
			side="top"
			align="start"
			sideOffset={8}
			class="z-50 min-w-36 rounded-lg border border-border bg-card p-1 shadow-lg outline-none"
		>
			{#each locales as loc}
				<DropdownMenu.Item
					class="flex w-full cursor-pointer items-center rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus:bg-accent data-[highlighted]:bg-accent {loc.code === currentLocale ? 'bg-primary text-primary-foreground focus:bg-primary/90 data-[highlighted]:bg-primary/90' : 'text-foreground'}"
					onclick={() => handleSelect(loc.code)}
				>
					{loc.name}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
