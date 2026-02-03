<script lang="ts">
	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		size?: 'sm' | 'md';
	}

	let { text, position = 'top', size = 'sm' }: Props = $props();
</script>

<span class="hint-icon {size}" data-position={position}>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon">
		<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
	</svg>
	<span class="tooltip">{text}</span>
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
		min-width: 200px;
		max-width: 500px;
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
		transform: translateX(-50%);
	}

	/* Position: bottom */
	[data-position="bottom"] .tooltip {
		top: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
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
