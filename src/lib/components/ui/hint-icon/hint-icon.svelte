<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		size?: 'sm' | 'md';
		tooltipMinWidth?: string;
		tooltipMaxWidth?: string;
	}

	let {
		text,
		position = 'top',
		size = 'sm',
		tooltipMinWidth = '200px',
		tooltipMaxWidth = '500px'
	}: Props = $props();
</script>

<Tooltip.Provider delayDuration={120}>
	<Tooltip.Root>
		<Tooltip.Trigger
			aria-label={text}
			class="inline-flex cursor-help items-center text-slate-400 transition-colors hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class={size === 'sm' ? 'h-[14px] w-[14px]' : 'h-4 w-4'}
			>
				<path
					d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
				/>
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
				<line x1="12" x2="12.01" y1="17" y2="17" />
			</svg>
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content
				side={position}
				sideOffset={6}
				class="z-50 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg outline-none dark:border-slate-600 dark:bg-slate-800"
				style={`min-width: ${tooltipMinWidth}; max-width: ${tooltipMaxWidth};`}
			>
				{text}
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
