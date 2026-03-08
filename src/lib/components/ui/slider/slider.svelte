<script lang="ts">
	import { Slider as SliderPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		class: className = '',
		onchange
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number | number[];
		disabled?: boolean;
		class?: string;
		onchange?: (value: number) => void;
	} = $props();
</script>

<SliderPrimitive.Root
	type="single"
	bind:value
	{min}
	{max}
	{step}
	{disabled}
	onValueChange={(nextValue) => onchange?.(nextValue)}
	class={cn('relative inline-flex w-full touch-none select-none items-center py-1', className)}
>
	<span class="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
		<SliderPrimitive.Range class="absolute h-full rounded-full bg-primary" />
	</span>
	<SliderPrimitive.Thumb
		index={0}
		class="block h-4 w-4 rounded-full border border-primary/30 bg-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50"
	/>
</SliderPrimitive.Root>
