<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	interface TabOption {
		value: any;
		label: string;
		icon?: any;
	}

	let {
		options,
		value = $bindable(),
		onchange,
		disabled = false,
		size = 'sm'
	}: {
		options: TabOption[];
		value: any;
		onchange?: (value: any) => void;
		disabled?: boolean;
		size?: 'sm' | 'default';
	} = $props();

	const getOptionKey = (index: number) => String(index);
	const getSelectedKey = () => {
		const selectedIndex = options.findIndex((option) => option.value === value);
		return selectedIndex >= 0 ? getOptionKey(selectedIndex) : undefined;
	};

	let selectedKey = $state<string | undefined>(getSelectedKey());

	$effect(() => {
		selectedKey = getSelectedKey();
	});

	function select(key: string) {
		const selectedIndex = Number(key);
		const nextValue = options[selectedIndex]?.value;
		if (nextValue === undefined) return;
		value = nextValue;
		onchange?.(nextValue);
	}
</script>

<ToggleGroupPrimitive.Root
	type="single"
	value={selectedKey}
	onValueChange={(nextKey) => {
		if (nextKey) select(nextKey);
	}}
	{disabled}
	class={cn(
		'inline-flex flex-wrap rounded-md border border-border/50 bg-muted/90 p-0.5 dark:border-border/30 dark:bg-muted/60',
		size === 'sm' ? 'text-xs' : 'text-sm'
	)}
>
	{#each options as option, index}
		<ToggleGroupPrimitive.Item
			value={getOptionKey(index)}
			{disabled}
			class={cn(
				'inline-flex items-center justify-center gap-1.5 rounded-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
				size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5',
				'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:font-medium',
				'data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground',
				disabled && 'cursor-not-allowed opacity-50'
			)}
		>
			{#if option.icon}
				<option.icon class={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
			{/if}
			{option.label}
		</ToggleGroupPrimitive.Item>
	{/each}
</ToggleGroupPrimitive.Root>
