<script lang="ts">
	import { toast } from './toast-store';
	import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-svelte';

	const icons = {
		success: CheckCircle,
		error: XCircle,
		info: Info,
		warning: AlertTriangle
	};

	const colors = {
		success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
		error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
		info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
		warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
	};

	const iconColors = {
		success: 'text-green-500',
		error: 'text-red-500',
		info: 'text-blue-500',
		warning: 'text-yellow-500'
	};
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
	{#each $toast as t (t.id)}
		<div
			class="flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in {colors[t.type]}"
			role="alert"
		>
			<svelte:component this={icons[t.type]} class="w-5 h-5 flex-shrink-0 {iconColors[t.type]}" />
			<p class="flex-1 text-sm">{t.message}</p>
			<button
				class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
				onclick={() => toast.remove(t.id)}
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in {
		animation: slide-in 0.2s ease-out;
	}
</style>
