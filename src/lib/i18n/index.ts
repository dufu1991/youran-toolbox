import { browser } from '$app/environment';
import { init, register, locale, getLocaleFromNavigator } from 'svelte-i18n';

// 动态导入所有语言文件
const localeFiles = import.meta.glob('./locales/*.json');

// 支持的语言列表
const supportedLocales = Object.keys(localeFiles).map((path) =>
	path.replace('./locales/', '').replace('.json', '')
);

// 获取所有可用语言
export async function getAvailableLocales(): Promise<{ code: string; name: string; flag: string }[]> {
	const locales: { code: string; name: string; flag: string }[] = [];

	for (const path in localeFiles) {
		const code = path.replace('./locales/', '').replace('.json', '');
		const module = (await localeFiles[path]()) as { default: { _meta: { name: string; flag: string } } };
		const meta = module.default._meta;
		locales.push({
			code,
			name: meta.name,
			flag: meta.flag
		});
	}

	return locales;
}

// 注册所有语言
for (const path in localeFiles) {
	const code = path.replace('./locales/', '').replace('.json', '');
	register(code, () => localeFiles[path]() as Promise<Record<string, unknown>>);
}

// 匹配系统语言到支持的语言
function matchLocale(navigatorLocale: string | null): string {
	if (!navigatorLocale) return 'zh-CN';

	// 精确匹配
	if (supportedLocales.includes(navigatorLocale)) {
		return navigatorLocale;
	}

	// 语言代码匹配（如 zh 匹配 zh-CN，en 匹配 en）
	const langCode = navigatorLocale.split('-')[0];
	const matched = supportedLocales.find((loc) => loc.startsWith(langCode));

	return matched || 'zh-CN';
}

// 获取初始语言
function getInitialLocale(): string {
	if (!browser) return 'zh-CN';

	// 优先使用用户保存的语言偏好
	const saved = localStorage.getItem('locale');
	if (saved && supportedLocales.includes(saved)) {
		return saved;
	}

	// 获取操作系统语言
	return matchLocale(getLocaleFromNavigator());
}

// 初始化 i18n
init({
	fallbackLocale: 'zh-CN',
	initialLocale: getInitialLocale()
});

// 设置语言并保存到本地存储
export function setLocale(newLocale: string) {
	locale.set(newLocale);
	if (browser) {
		localStorage.setItem('locale', newLocale);
	}
}

export { locale };
