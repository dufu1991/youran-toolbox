<script lang="ts">
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

	function select(val: any) {
		if (disabled) return;
		value = val;
		onchange?.(val);
	}
</script>

<div
	class="inline-flex rounded-md border border-border/50 bg-muted/90 p-0.5 dark:border-border/30 dark:bg-muted/60 {size === 'sm' ? 'text-xs' : 'text-sm'}"
>
	{#each options as option}
		<button
			class="rounded-sm transition-all flex items-center justify-center gap-1.5
				{size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'}
				{value === option.value
				? 'bg-background text-foreground shadow-sm font-medium'
				: 'text-muted-foreground hover:text-foreground'}
				{disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
			onclick={() => select(option.value)}
			{disabled}
		>
			{#if option.icon}
				<option.icon class={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
			{/if}
			{option.label}
		</button>
	{/each}
</div>
