<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { Check } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let {
		checked = $bindable(false),
		disabled = false,
		class: className = '',
		ariaLabel,
		onchange
	}: {
		checked?: boolean;
		disabled?: boolean;
		class?: string;
		ariaLabel?: string;
		onchange?: (checked: boolean) => void;
	} = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	{disabled}
	aria-label={ariaLabel}
	onCheckedChange={(nextChecked) => onchange?.(nextChecked)}
	class={cn(
		'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50',
		'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
		className
	)}
>
	<Check class="h-3 w-3" />
</CheckboxPrimitive.Root>
