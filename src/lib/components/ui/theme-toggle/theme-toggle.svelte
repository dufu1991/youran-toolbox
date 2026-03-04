<script lang="ts">
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		mode: 'light' | 'dark' | 'auto';
		onToggle: () => void;
		title?: string;
	}

	let { mode, onToggle, title = '' }: Props = $props();
</script>

<Button variant="ghost" size="icon" onclick={onToggle} class="w-9 h-9" {title}>
	{#if mode === 'light'}
		<Sun class="w-5 h-5" />
	{:else if mode === 'dark'}
		<Moon class="w-5 h-5" />
	{:else}
		<Monitor class="w-5 h-5" />
	{/if}
</Button>
