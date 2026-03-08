import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { getVersion } from '@tauri-apps/api/app';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import { _ } from 'svelte-i18n';

const GITHUB_LATEST_RELEASE_API = 'https://api.github.com/repos/dufu1991/youran-toolbox/releases/latest';
export const OFFICIAL_DOWNLOAD_URL = 'https://youran-toolbox.du-fu.com';

interface UpdateInfoState {
	currentVersion: string;
	latestVersion: string;
	checking: boolean;
	checked: boolean;
	hasUpdate: boolean;
	error: string;
	releaseUrl: string;
}

export interface UpdateCheckResult {
	currentVersion: string;
	latestVersion: string;
	hasUpdate: boolean;
	releaseUrl: string;
}

const initialState: UpdateInfoState = {
	currentVersion: '',
	latestVersion: '',
	checking: false,
	checked: false,
	hasUpdate: false,
	error: '',
	releaseUrl: OFFICIAL_DOWNLOAD_URL
};

export const updateInfo = writable<UpdateInfoState>(initialState);

export function normalizeVersion(version: string): string {
	return (version || '').replace(/^v/i, '');
}

export function compareVersions(a: string, b: string): number {
	const parse = (version: string) =>
		normalizeVersion(version)
			.split('.')
			.map((part) => Number.parseInt(part, 10) || 0);

	const left = parse(a);
	const right = parse(b);
	const length = Math.max(left.length, right.length);

	for (let i = 0; i < length; i += 1) {
		const leftPart = left[i] || 0;
		const rightPart = right[i] || 0;
		if (leftPart > rightPart) return 1;
		if (leftPart < rightPart) return -1;
	}

	return 0;
}

export async function ensureCurrentVersionLoaded(): Promise<string> {
	const current = get(updateInfo).currentVersion;
	if (current) return current;

	const fallbackVersion = normalizeVersion(__APP_VERSION__);
	if (!browser) {
		updateInfo.update((state) => ({ ...state, currentVersion: fallbackVersion }));
		return fallbackVersion;
	}

	let version = fallbackVersion;
	if ('__TAURI_INTERNALS__' in window) {
		version = normalizeVersion(await getVersion());
	}

	updateInfo.update((state) => ({ ...state, currentVersion: version }));
	return version;
}

async function fetchLatestRelease() {
	const response = await fetch(GITHUB_LATEST_RELEASE_API, {
		headers: {
			Accept: 'application/vnd.github+json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch latest release: ${response.status}`);
	}

	return response.json() as Promise<{
		tag_name?: string;
		name?: string;
		html_url?: string;
	}>;
}

export async function checkForUpdates(): Promise<UpdateCheckResult> {
	const currentVersion = await ensureCurrentVersionLoaded();

	updateInfo.update((state) => ({
		...state,
		checking: true,
		error: ''
	}));

	const release = await fetchLatestRelease();
	const latestVersion = normalizeVersion(release.tag_name || release.name || currentVersion);
	const releaseUrl = release.html_url || OFFICIAL_DOWNLOAD_URL;
	const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

	const result = {
		currentVersion,
		latestVersion,
		hasUpdate,
		releaseUrl
	};

	updateInfo.set({
		currentVersion,
		latestVersion,
		checking: false,
		checked: true,
		hasUpdate,
		error: '',
		releaseUrl
	});

	return result;
}

function isTauriRuntime(): boolean {
	return browser && '__TAURI_INTERNALS__' in window;
}

async function showInfoDialog(messageText: string, titleText: string) {
	if (isTauriRuntime()) {
		await message(messageText, {
			title: titleText,
			kind: 'info',
			buttons: { ok: 'OK' }
		});
		return;
	}

	window.alert(`${titleText}\n\n${messageText}`);
}

async function showConfirmDialog(messageText: string, titleText: string, okText: string, cancelText: string) {
	if (isTauriRuntime()) {
		return confirm(messageText, {
			title: titleText,
			kind: 'info',
			okLabel: okText,
			cancelLabel: cancelText
		});
	}

	return window.confirm(`${titleText}\n\n${messageText}`);
}

async function openOfficialWebsite() {
	if (isTauriRuntime()) {
		await openUrl(OFFICIAL_DOWNLOAD_URL);
		return;
	}

	window.open(OFFICIAL_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
}

export async function handleUpdateCheck(options?: {
	showNoUpdateMessage?: boolean;
	silentError?: boolean;
}) {
	const { showNoUpdateMessage = false, silentError = false } = options || {};

	try {
		const result = await checkForUpdates();
		const t = get(_);

		if (result.hasUpdate) {
			const confirmed = await showConfirmDialog(
				t('settings.updateDialogMessage', {
					values: {
						current: `v ${result.currentVersion}`,
						latest: `v ${result.latestVersion}`
					}
				}),
				t('settings.updateDialogTitle'),
				t('settings.openWebsite'),
				t('settings.notNow')
			);

			if (confirmed) {
				await openOfficialWebsite();
			}

			return result;
		}

		if (showNoUpdateMessage) {
			await showInfoDialog(
				t('settings.noUpdateMessage', {
					values: {
						current: `v ${result.currentVersion}`
					}
				}),
				t('settings.updateUnavailable')
			);
		}

		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		updateInfo.update((state) => ({
			...state,
			checking: false,
			checked: true,
			error: errorMessage
		}));

		if (!silentError) {
			const t = get(_);
			await showInfoDialog(t('settings.updateCheckFailed'), t('settings.updateCheckFailedTitle'));
		}

		return null;
	}
}
