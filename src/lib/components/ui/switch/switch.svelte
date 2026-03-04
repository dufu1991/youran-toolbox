<script lang="ts">
	let {
		checked = $bindable(false),
		size = 'default',
		disabled = false,
		onchange
	}: {
		checked: boolean;
		size?: 'sm' | 'default';
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	} = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	class="relative rounded-full transition-colors border
		{size === 'sm' ? 'w-9 h-5' : 'w-11 h-6'}
		{checked ? 'bg-primary border-primary' : 'bg-foreground/15 border-foreground/25'}
		{disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
	onclick={toggle}
	{disabled}
>
	<span
		class="absolute inset-y-0 my-auto rounded-full shadow transition-transform
			{size === 'sm' ? 'left-[3px] w-3.5 h-3.5' : 'left-[3px] w-[18px] h-[18px]'}
			{checked
				? (size === 'sm' ? 'translate-x-[14px] bg-primary-foreground' : 'translate-x-[18px] bg-primary-foreground')
				: 'bg-white'}"
	></span>
</button>
