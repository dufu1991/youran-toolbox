<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/index.js';

	let {
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cn('rounded-xl border border-border bg-card/50 text-card-foreground', className)}
	{...restProps}
>
	{@render children?.()}
</div>
