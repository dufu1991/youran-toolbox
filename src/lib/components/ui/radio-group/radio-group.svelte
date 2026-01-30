<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { value = $bindable(), onValueChange, disabled, class: className, children }: Props = $props();
</script>

<RadioGroupPrimitive.Root
	bind:value
	{onValueChange}
	{disabled}
	class={cn('flex flex-wrap gap-2', className)}
>
	{@render children?.()}
</RadioGroupPrimitive.Root>
