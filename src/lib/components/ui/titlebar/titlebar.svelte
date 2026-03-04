<script lang="ts">
	import { onMount } from 'svelte';
	import MacosTitlebar from './macos-titlebar.svelte';
	import WindowsTitlebar from './windows-titlebar.svelte';
	import LinuxTitlebar from './linux-titlebar.svelte';

	let platform = $state('');

	onMount(() => {
		const ua = navigator.platform.toUpperCase();
		if (ua.includes('MAC')) {
			platform = 'macos';
		} else if (ua.includes('WIN')) {
			platform = 'windows';
		} else {
			platform = 'linux';
		}
	});
</script>

{#if platform === 'macos'}
	<MacosTitlebar />
{:else if platform === 'windows'}
	<WindowsTitlebar />
{:else if platform === 'linux'}
	<LinuxTitlebar />
{/if}
