<script lang="ts">
	import { getCurrentWindow } from '@tauri-apps/api/window';

	const appWindow = getCurrentWindow();

	function close() {
		appWindow.close();
	}

	function minimize() {
		appWindow.minimize();
	}

	async function toggleMaximize() {
		const maximized = await appWindow.isMaximized();
		if (maximized) {
			await appWindow.unmaximize();
		} else {
			await appWindow.maximize();
		}
	}
</script>

<div class="group pointer-events-auto flex items-center gap-[7px] pl-[1px]">
	<!-- 关闭 -->
	<button
		class="w-[15px] h-[15px] rounded-full flex items-center justify-center"
		aria-label="Close"
		onclick={close}
	>
		<svg viewBox="0 0 15 15" class="w-[15px] h-[15px]">
			<circle cx="7.5" cy="7.5" r="7" fill="#ff5f57" stroke="#e0443e" stroke-width="0.5" />
			<g class="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
				<line x1="5" y1="5" x2="10" y2="10" stroke="#4a0002" stroke-width="1.2" stroke-linecap="round" />
				<line x1="10" y1="5" x2="5" y2="10" stroke="#4a0002" stroke-width="1.2" stroke-linecap="round" />
			</g>
		</svg>
	</button>
	<!-- 最小化 -->
	<button
		class="w-[15px] h-[15px] rounded-full flex items-center justify-center"
		aria-label="Minimize"
		onclick={minimize}
	>
		<svg viewBox="0 0 15 15" class="w-[15px] h-[15px]">
			<circle cx="7.5" cy="7.5" r="7" fill="#febc2e" stroke="#dea123" stroke-width="0.5" />
			<line
				x1="4.5" y1="7.5" x2="10.5" y2="7.5"
				stroke="#5a3900" stroke-width="1.2" stroke-linecap="round"
				class="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
			/>
		</svg>
	</button>
	<!-- 最大化 -->
	<button
		class="w-[15px] h-[15px] rounded-full flex items-center justify-center"
		aria-label="Maximize"
		onclick={toggleMaximize}
	>
		<svg viewBox="0 0 15 15" class="w-[15px] h-[15px]">
			<circle cx="7.5" cy="7.5" r="7" fill="#28c840" stroke="#1aab29" stroke-width="0.5" />
			<g class="opacity-0 transition-opacity duration-150 group-hover:opacity-100" stroke="#006500" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
				<!-- macOS 26 对角展开箭头 -->
				<path d="M4.5 6.5 L4.5 4.5 L6.5 4.5" />
				<line x1="4.5" y1="4.5" x2="7" y2="7" />
				<path d="M10.5 8.5 L10.5 10.5 L8.5 10.5" />
				<line x1="10.5" y1="10.5" x2="8" y2="8" />
			</g>
		</svg>
	</button>
</div>
