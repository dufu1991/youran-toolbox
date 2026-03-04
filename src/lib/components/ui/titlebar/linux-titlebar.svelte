<script lang="ts">
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { Minus, Square, X } from 'lucide-svelte';

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

<div class="pointer-events-auto flex items-center gap-0.5 px-2">
	<button
		class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
		onclick={minimize}
	>
		<Minus class="w-4 h-4" />
	</button>
	<button
		class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
		onclick={toggleMaximize}
	>
		<Square class="w-3.5 h-3.5" />
	</button>
	<button
		class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white transition-colors"
		onclick={close}
	>
		<X class="w-4 h-4" />
	</button>
</div>
