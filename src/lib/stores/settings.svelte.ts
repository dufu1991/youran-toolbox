import { browser } from '$app/environment';

export interface AppSettings {
	primaryColor: string;
	opacity: number;
	contentFullWidth: boolean;
	windowSizeMode: 'default' | 'remember';
	windowWidth: number;
	windowHeight: number;
	windowX: number;
	windowY: number;
}

const DEFAULT_SETTINGS: AppSettings = {
	primaryColor: 'default',
	opacity: 50,
	contentFullWidth: true,
	windowSizeMode: 'default',
	windowWidth: 1280,
	windowHeight: 860,
	windowX: -1,
	windowY: -1
};

const STORAGE_KEY = 'app-settings';

function loadSettings(): AppSettings {
	if (!browser) return { ...DEFAULT_SETTINGS };
	const saved = localStorage.getItem(STORAGE_KEY);
	if (!saved) return { ...DEFAULT_SETTINGS };
	return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
}

interface ColorEntry {
	light: string;
	dark: string;
	fgLight: string;
	fgDark: string;
	preview: string;
}

export const primaryColorMap: Record<string, ColorEntry> = {
	default: {
		light: 'oklch(0.205 0 0)',
		dark: 'oklch(0.985 0 0)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.205 0 0)',
		preview: '#333333'
	},
	red: {
		light: 'oklch(0.55 0.2 27)',
		dark: 'oklch(0.65 0.2 27)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#ef4444'
	},
	rose: {
		light: 'oklch(0.55 0.2 15)',
		dark: 'oklch(0.65 0.2 15)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#f43f5e'
	},
	pink: {
		light: 'oklch(0.55 0.2 350)',
		dark: 'oklch(0.65 0.2 350)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#ec4899'
	},
	fuchsia: {
		light: 'oklch(0.55 0.22 335)',
		dark: 'oklch(0.65 0.22 335)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#d946ef'
	},
	purple: {
		light: 'oklch(0.55 0.2 300)',
		dark: 'oklch(0.65 0.2 300)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#a855f7'
	},
	violet: {
		light: 'oklch(0.55 0.2 290)',
		dark: 'oklch(0.65 0.2 290)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#8b5cf6'
	},
	indigo: {
		light: 'oklch(0.55 0.2 275)',
		dark: 'oklch(0.65 0.2 275)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#6366f1'
	},
	blue: {
		light: 'oklch(0.55 0.2 250)',
		dark: 'oklch(0.65 0.2 250)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#3b82f6'
	},
	sky: {
		light: 'oklch(0.55 0.18 225)',
		dark: 'oklch(0.65 0.18 225)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#0ea5e9'
	},
	cyan: {
		light: 'oklch(0.55 0.17 200)',
		dark: 'oklch(0.65 0.17 200)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#06b6d4'
	},
	teal: {
		light: 'oklch(0.55 0.17 175)',
		dark: 'oklch(0.65 0.17 175)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#14b8a6'
	},
	green: {
		light: 'oklch(0.55 0.18 155)',
		dark: 'oklch(0.65 0.18 155)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.985 0 0)',
		preview: '#22c55e'
	},
	lime: {
		light: 'oklch(0.55 0.17 130)',
		dark: 'oklch(0.65 0.17 130)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.145 0 0)',
		preview: '#84cc16'
	},
	yellow: {
		light: 'oklch(0.55 0.16 85)',
		dark: 'oklch(0.68 0.16 85)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.145 0 0)',
		preview: '#eab308'
	},
	orange: {
		light: 'oklch(0.6 0.18 55)',
		dark: 'oklch(0.7 0.18 55)',
		fgLight: 'oklch(0.985 0 0)',
		fgDark: 'oklch(0.145 0 0)',
		preview: '#f97316'
	}
};

export const colorOptions = Object.entries(primaryColorMap).map(([value, entry]) => ({
	value,
	preview: entry.preview
}));

export function applyPrimaryColor(color: string) {
	if (!browser) return;
	const entry = primaryColorMap[color] || primaryColorMap.default;
	document.documentElement.style.setProperty('--color-primary-override', entry.light);
	document.documentElement.style.setProperty('--color-primary-override-dark', entry.dark);
	document.documentElement.style.setProperty('--color-primary-fg-override', entry.fgLight);
	document.documentElement.style.setProperty('--color-primary-fg-override-dark', entry.fgDark);
}

let settings = $state<AppSettings>(loadSettings());

function save() {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}
}

// 将窗口状态写入文件，供 Rust 端启动时读取
async function saveWindowStateToFile() {
	if (!browser) return;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('save_window_state', {
			state: JSON.stringify({
				windowSizeMode: settings.windowSizeMode,
				windowWidth: settings.windowWidth,
				windowHeight: settings.windowHeight,
				windowX: settings.windowX,
				windowY: settings.windowY
			})
		});
	} catch (e) {
		console.error('Failed to save window state:', e);
	}
}

export const appSettings = {
	get current() {
		return settings;
	},
	update(partial: Partial<AppSettings>) {
		Object.assign(settings, partial);
		if (partial.primaryColor !== undefined) {
			applyPrimaryColor(partial.primaryColor);
		}
		save();
		if (partial.windowSizeMode !== undefined) {
			saveWindowStateToFile();
		}
	},
	saveWindowSize(width: number, height: number) {
		if (settings.windowSizeMode !== 'remember') return;
		settings.windowWidth = width;
		settings.windowHeight = height;
		save();
		saveWindowStateToFile();
	},
	saveWindowPosition(x: number, y: number) {
		if (settings.windowSizeMode !== 'remember') return;
		settings.windowX = x;
		settings.windowY = y;
		save();
		saveWindowStateToFile();
	},
	reset() {
		Object.assign(settings, { ...DEFAULT_SETTINGS });
		applyPrimaryColor(DEFAULT_SETTINGS.primaryColor);
		save();
		saveWindowStateToFile();
	}
};

// 全局主题模式
let themeMode = $state<'light' | 'dark' | 'auto'>('auto');

function applyTheme() {
	if (!browser) return;
	let effectiveMode: 'light' | 'dark';
	if (themeMode === 'auto') {
		effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	} else {
		effectiveMode = themeMode;
	}
	document.documentElement.setAttribute('data-mode', effectiveMode);
}

export const theme = {
	get mode() {
		return themeMode;
	},
	toggle() {
		if (themeMode === 'light') {
			themeMode = 'dark';
		} else if (themeMode === 'dark') {
			themeMode = 'auto';
		} else {
			themeMode = 'light';
		}
		if (browser) {
			localStorage.setItem('theme-mode', themeMode);
			applyTheme();
		}
	},
	init() {
		if (!browser) return;
		const saved = localStorage.getItem('theme-mode');
		if (saved === 'dark' || saved === 'light' || saved === 'auto') {
			themeMode = saved;
		}
		applyTheme();
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (themeMode === 'auto') {
				applyTheme();
			}
		});
	}
};
