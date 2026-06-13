<script lang="ts">
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		mode: 'light' | 'dark' | 'auto';
		onToggle: () => void;
		title?: string;
		buttonClass?: string;
		iconClass?: string;
	}

	let { mode, onToggle, title = '', buttonClass = 'w-9 h-9', iconClass = 'w-5 h-5' }: Props = $props();
</script>

<Button variant="ghost" size="icon" onclick={onToggle} class={buttonClass} {title}>
	{#if mode === 'light'}
		<Sun class={iconClass} />
	{:else if mode === 'dark'}
		<Moon class={iconClass} />
	{:else}
		<Monitor class={iconClass} />
	{/if}
</Button>
