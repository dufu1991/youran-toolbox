<script lang="ts">
	import { Minus, Plus } from 'lucide-svelte';

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		class: className = '',
		onchange
	}: {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		class?: string;
		onchange?: () => void;
	} = $props();

	function decrement() {
		if (disabled || value <= min) return;
		value = Math.max(min, Number((value - step).toFixed(10)));
		onchange?.();
	}

	function increment() {
		if (disabled || value >= max) return;
		value = Math.min(max, Number((value + step).toFixed(10)));
		onchange?.();
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const raw = target.value;
		if (raw === '' || raw === '-') return;
		let num = Number(raw);
		if (isNaN(num)) return;
		num = Math.max(min, Math.min(max, num));
		value = num;
		onchange?.();
	}

	function handleBlur(e: Event) {
		const target = e.target as HTMLInputElement;
		let num = Number(target.value);
		if (isNaN(num)) num = min;
		value = Math.max(min, Math.min(max, num));
	}
</script>

<div
	class="inline-flex items-center rounded-lg border border-border h-8 {className}"
	class:opacity-50={disabled}
	class:cursor-not-allowed={disabled}
>
	<button
		type="button"
		class="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors rounded-l-[7px] disabled:opacity-30 disabled:cursor-not-allowed"
		onclick={decrement}
		disabled={disabled || value <= min}
	>
		<Minus class="w-3 h-3" />
	</button>
	<input
		type="text"
		inputmode="numeric"
		class="w-10 h-full text-center text-sm bg-transparent border-x border-border outline-none"
		value={value}
		{disabled}
		oninput={handleInput}
		onblur={handleBlur}
	/>
	<button
		type="button"
		class="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors rounded-r-[7px] disabled:opacity-30 disabled:cursor-not-allowed"
		onclick={increment}
		disabled={disabled || value >= max}
	>
		<Plus class="w-3 h-3" />
	</button>
</div>
