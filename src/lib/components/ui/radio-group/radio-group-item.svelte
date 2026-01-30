<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { value, disabled, class: className, children }: Props = $props();
</script>

<label class={cn('flex items-center gap-2 cursor-pointer', disabled && 'cursor-not-allowed opacity-50', className)}>
	<RadioGroupPrimitive.Item
		{value}
		{disabled}
		class="w-4 h-4 rounded-full border border-slate-300 bg-white transition-colors data-[state=checked]:border-primary data-[state=checked]:border-[5px] focus:outline-none focus:ring-2 focus:ring-primary/20"
	/>
	<span class="text-sm text-slate-700">{@render children?.()}</span>
</label>
