<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		checked = $bindable(false),
		size = 'default',
		disabled = false,
		class: className = '',
		ariaLabel,
		onchange
	}: {
		checked: boolean;
		size?: 'sm' | 'default';
		disabled?: boolean;
		class?: string;
		ariaLabel?: string;
		onchange?: (checked: boolean) => void;
	} = $props();
</script>

<SwitchPrimitive.Root
	bind:checked
	{disabled}
	aria-label={ariaLabel}
	onCheckedChange={(nextChecked) => onchange?.(nextChecked)}
	class={cn(
		'relative inline-flex shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50',
		size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
		'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
		'data-[state=unchecked]:border-foreground/20 data-[state=unchecked]:bg-foreground/12',
		className
	)}
>
	<SwitchPrimitive.Thumb
		class={cn(
			'pointer-events-none block rounded-full bg-white shadow-sm transition-transform dark:bg-background',
			size === 'sm'
				? 'h-3.5 w-3.5 translate-x-[3px] data-[state=checked]:translate-x-[17px]'
				: 'h-[18px] w-[18px] translate-x-[3px] data-[state=checked]:translate-x-[21px]',
			'data-[state=checked]:bg-primary-foreground'
		)}
	/>
</SwitchPrimitive.Root>
