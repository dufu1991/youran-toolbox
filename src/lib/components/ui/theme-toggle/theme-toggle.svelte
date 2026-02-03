<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		mode: 'light' | 'dark';
		onToggle: () => void;
	}

	let { mode, onToggle }: Props = $props();
</script>

<Button variant="ghost" size="icon" onclick={onToggle} class="w-9 h-9">
	{#if mode === 'light'}
		<Sun class="w-5 h-5" />
	{:else}
		<Moon class="w-5 h-5" />
	{/if}
</Button>
