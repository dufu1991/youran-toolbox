<script lang="ts">
	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		size?: 'sm' | 'md';
		tooltipMinWidth?: string;
		tooltipMaxWidth?: string;
		boundarySelector?: string;
	}

	let {
		text,
		position = 'top',
		size = 'sm',
		tooltipMinWidth = '200px',
		tooltipMaxWidth = '500px',
		boundarySelector = '[data-tooltip-boundary]'
	}: Props = $props();

	let hintIconEl: HTMLSpanElement | null = $state(null);
	let tooltipEl: HTMLSpanElement | null = $state(null);
	let actualPosition: 'top' | 'bottom' | 'left' | 'right' = $state('top');
	let tooltipShiftX = $state('0px');

	$effect(() => {
		actualPosition = position;
	});

	function updateTooltipPosition() {
		if (!hintIconEl || !tooltipEl) return;

		const boundaryEl = hintIconEl.closest(boundarySelector);
		if (!boundaryEl) {
			actualPosition = position;
			return;
		}

		const boundaryRect = boundaryEl.getBoundingClientRect();
		const triggerRect = hintIconEl.getBoundingClientRect();
		const tooltipRect = tooltipEl.getBoundingClientRect();
		const gap = 6;
		const boundaryPadding = 4;
		tooltipShiftX = '0px';

		if (position === 'right') {
			const rightEdge = triggerRect.right + gap + tooltipRect.width;
			actualPosition = rightEdge > boundaryRect.right ? 'left' : 'right';
			return;
		}

		if (position === 'left') {
			const leftEdge = triggerRect.left - gap - tooltipRect.width;
			actualPosition = leftEdge < boundaryRect.left ? 'right' : 'left';
			return;
		}

		if (position === 'top' || position === 'bottom') {
			const centerLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
			const centerRight = centerLeft + tooltipRect.width;

			if (centerLeft < boundaryRect.left + boundaryPadding) {
				tooltipShiftX = `${boundaryRect.left + boundaryPadding - centerLeft}px`;
			} else if (centerRight > boundaryRect.right - boundaryPadding) {
				tooltipShiftX = `${boundaryRect.right - boundaryPadding - centerRight}px`;
			}

			if (position === 'top') {
				const topEdge = triggerRect.top - gap - tooltipRect.height;
				actualPosition = topEdge < boundaryRect.top + boundaryPadding ? 'bottom' : 'top';
				return;
			}

			const bottomEdge = triggerRect.bottom + gap + tooltipRect.height;
			actualPosition = bottomEdge > boundaryRect.bottom - boundaryPadding ? 'top' : 'bottom';
			return;
		}

		actualPosition = position;
	}

	function bindAutoPosition(node: HTMLSpanElement) {
		const update = () => updateTooltipPosition();
		node.addEventListener('mouseenter', update);
		node.addEventListener('focusin', update);

		return {
			destroy() {
				node.removeEventListener('mouseenter', update);
				node.removeEventListener('focusin', update);
			}
		};
	}
</script>

<span
	bind:this={hintIconEl}
	use:bindAutoPosition
	class="hint-icon {size}"
	data-position={actualPosition}
	style="--tooltip-min-width: {tooltipMinWidth}; --tooltip-max-width: {tooltipMaxWidth}; --tooltip-shift-x: {tooltipShiftX};"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="icon"
	>
		<path
			d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
		/>
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
		<line x1="12" x2="12.01" y1="17" y2="17" />
	</svg>
	<span bind:this={tooltipEl} class="tooltip">{text}</span>
</span>

<style>
	.hint-icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		cursor: help;
		color: var(--hint-color, #94a3b8);
		vertical-align: middle;
	}

	.hint-icon:hover {
		color: var(--hint-hover-color, #64748b);
	}

	.hint-icon.sm .icon {
		width: 14px;
		height: 14px;
	}

	.hint-icon.md .icon {
		width: 16px;
		height: 16px;
	}

	.tooltip {
		position: absolute;
		z-index: 50;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: normal;
		line-height: 1.5;
		color: white;
		background-color: #1e293b;
		border-radius: 6px;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.15s, visibility 0.15s;
		pointer-events: none;
		min-width: var(--tooltip-min-width);
		max-width: var(--tooltip-max-width);
		white-space: normal;
		text-align: left;
		word-break: break-word;
	}

	.hint-icon:hover .tooltip {
		opacity: 1;
		visibility: visible;
	}

	/* Position: top */
	[data-position="top"] .tooltip {
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(calc(-50% + var(--tooltip-shift-x)));
	}

	/* Position: bottom */
	[data-position="bottom"] .tooltip {
		top: calc(100% + 6px);
		left: 50%;
		transform: translateX(calc(-50% + var(--tooltip-shift-x)));
	}

	/* Position: left */
	[data-position="left"] .tooltip {
		right: calc(100% + 6px);
		top: 50%;
		transform: translateY(-50%);
	}

	/* Position: right */
	[data-position="right"] .tooltip {
		left: calc(100% + 6px);
		top: 50%;
		transform: translateY(-50%);
	}

	:global(.dark) .tooltip {
		background-color: #334155;
	}

	:global(.dark) .hint-icon {
		--hint-color: #64748b;
		--hint-hover-color: #94a3b8;
	}
</style>
