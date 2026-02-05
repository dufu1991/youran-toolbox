<script lang="ts">
	import '../app.css';
	import '$lib/i18n';
	import { _, isLoading } from 'svelte-i18n';
	import { ThemeToggle } from '$lib/components/ui/theme-toggle';
	import { LocaleSwitcher } from '$lib/components/ui/locale-switcher';
	import { Toast } from '$lib/components/ui/toast';
	import { onMount } from 'svelte';

	let { children } = $props();
	let mode: 'light' | 'dark' = $state('light');

	onMount(() => {
		const saved = localStorage.getItem('theme-mode');
		if (saved === 'dark' || saved === 'light') {
			mode = saved;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			mode = 'dark';
		}
		document.documentElement.setAttribute('data-mode', mode);
	});

	function toggleMode() {
		mode = mode === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme-mode', mode);
		document.documentElement.setAttribute('data-mode', mode);
	}

	const title = $derived($isLoading ? '悠然工具箱' : $_('app.title'));
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if $isLoading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
	</div>
{:else}
	<div class="fixed top-4 right-4 z-50 flex items-center gap-1">
		<LocaleSwitcher />
		<ThemeToggle {mode} onToggle={toggleMode} />
	</div>

	<Toast />

	{@render children()}
{/if}
