import './app.css';
import { marked } from 'marked';
import changelogMd from '../../CHANGELOG.md?raw';
import packageJson from '../../package.json';
import siteLocaleBundles from './site-locales.js';

const appVersion = packageJson.version;
const ossRootUrl = 'https://youran-toolbox.oss-cn-beijing.aliyuncs.com';
const ossBaseUrl = `${ossRootUrl}/latest`;
const githubDownloadBase = 'https://github.com/dufu1991/youran-toolbox/releases/download';

function buildOssDownloadUrl(fileName) {
  return `${ossBaseUrl}/${encodeURIComponent(fileName)}`;
}

function normalizeTagVersion(tagName) {
  return (tagName || '').replace(/^v/i, '');
}

function isVersionGte(version, baselineVersion) {
  const parseVersion = (v) => normalizeTagVersion(v).split('.').map(n => Number.parseInt(n, 10) || 0);
  const current = parseVersion(version);
  const baseline = parseVersion(baselineVersion);
  const len = Math.max(current.length, baseline.length);
  for (let i = 0; i < len; i += 1) {
    const a = current[i] || 0;
    const b = baseline[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return true;
}

function buildVersionedOssDownloadUrl(version, fileName) {
  const normalizedVersion = normalizeTagVersion(version);
  if (!normalizedVersion) return '#';
  return `${ossRootUrl}/v${normalizedVersion}/${encodeURIComponent(fileName)}`;
}

function buildGithubLatestDownloadUrl(fileName) {
  return `${githubDownloadBase}/v${appVersion}/${encodeURIComponent(fileName)}`;
}

const localeBundles = siteLocaleBundles;

const supportedLocales = Object.keys(localeBundles);
const siteLocaleStorageKey = 'youran_site_locale';
const featureLocaleKeyMap = {
  rename: 'rename',
  classify: 'classifyBatch',
  image: 'imageCompress',
  pdf: 'pdf',
  qrcode: 'qrcode',
  textdiff: 'textDiff',
  heatmap: 'heatmap',
};
const heroChipIdMap = {
  rename: 'hero-chip-rename',
  classify: 'hero-chip-classify',
  image: 'hero-chip-image',
  pdf: 'hero-chip-pdf',
  qrcode: 'hero-chip-qrcode',
  textdiff: 'hero-chip-textdiff',
  heatmap: 'hero-chip-heatmap',
};

const siteI18nEn = {
  navHome: 'Home',
  navGuide: 'Guide',
  navChangelog: 'Changelog',
  navPrivacy: 'Privacy',
  language: 'Language',
  heroTagline: 'Cross-platform · Local-first · Privacy-focused desktop tools',
  heroMainlandPrefix: 'This is the GitHub download link. If it is slow in Mainland China, use',
  heroMainlandLink: 'this mirror',
  heroChipUpdating: 'More coming soon',
  mobileTip: 'This app is desktop only. Please download on a computer.',
  supportText: 'Supports Apple Silicon Mac and Windows 10+ systems. Linux is not supported yet.',
  moreDownloads: 'More downloads →',
  featuresTitle: 'Features',
  featuresSubtitle: '7 practical tools for daily work',
  techTitle: 'Tech Stack',
  techSubtitle: 'Modern stack',
  faqTitle: 'FAQ',
  faqMacTitle: 'macOS says the app is damaged or unverified?',
  faqMacDesc: 'Run the command below in Terminal to remove quarantine:',
  faqMacCmd: 'xattr -dr com.apple.quarantine "/Applications/Youran Toolbox.app"',
  faqWindowsTitle: 'Windows installation tips',
  faqWindowsDesc: 'If SmartScreen blocks the installer, click "More info" and then "Run anyway".',
  guideTitle: 'Guide',
  guideSubtitle: 'Quick start for 7 tools',
  changelogTitle: 'Changelog',
  changelogSubtitle: 'Detailed update history',
  changelogFallback: 'For full release notes in this language, please check GitHub Releases.',
  downloadsTitle: 'Downloads',
  downloadsSubtitle: 'Choose the build for your OS',
  downloadsLoading: 'Loading release information...',
  platformNoteTitle: 'Platform Notes',
  platformNoteDesc: 'Built with Tauri. The UI is rendered by the OS built-in WebView: macOS uses WebKit (Safari engine), Windows uses WebView2 (Edge engine).',
  privacyTitle: 'Privacy Policy',
  privacySubtitle: 'How we protect your privacy',
  privacyOverviewTitle: 'Overview',
  privacyOverviewDesc: 'Youran Toolbox runs locally and does not collect, upload, or store user data.',
  privacyDataTitle: 'Data Handling',
  privacyDataItems: ['All processing is local', 'No network request during normal usage', 'No tracking code or third-party analytics'],
  privacyOpenSourceTitle: 'Open Source',
  privacyOpenSourceDesc: 'The source code is open. You can review it on GitHub.',
  footerRelease: 'Releases',
  footerIssues: 'Issues',
  downloadMac: 'macOS',
  downloadWindows: 'Windows',
  downloadMacShort: 'macOS',
  downloadWindowsShort: 'Windows',
  downloadWindowsMsiShort: 'Windows (MSI)',
  downloadGithub: 'Go to GitHub',
  downloadArchAppleSilicon: 'Apple Silicon',
  downloadArchX64: 'x64',
  downloadSizeUnitMb: 'MB',
  latestVersion: 'Latest',
  githubAddress: 'GitHub',
  aliyunAddress: 'Aliyun',
  historyVersions: 'History',
  historySummary: 'versions, click to expand',
  historySourceGithub: 'GitHub',
  historySourceAliyun: 'Aliyun',
  noPackages: 'No installer available',
  noVersions: 'No version available',
  loadFailed: 'Failed to load. Please',
  goGithub: 'view on GitHub',
  aliyunFromVersion: 'Aliyun downloads are available from 0.1.1',
  guideLiteHint: 'This page is simplified in this language. For full details, use the app.',
  advCrossTitle: 'Cross-platform',
  advCrossDesc: 'Native support for macOS and Windows, lightweight installer, fast startup.',
  advOfflineTitle: 'Fully Offline',
  advOfflineDesc: 'Everything runs locally without network dependency.',
  advPrivacyTitle: 'Privacy First',
  advPrivacyDesc: 'No upload, no collection, no tracking. Your files stay on your device.',
  advSimpleTitle: 'Simple UX',
  advSimpleDesc: 'Clean interface and clear workflows make it easy to use.',
  advThemeTitle: 'Light and Dark',
  advThemeDesc: 'Supports light, dark and system modes with rich theme colors.',
  advExperienceTitle: 'Polished Experience',
  advExperienceDesc: 'Thoughtful details across pages and interactions.',
  techDescSvelte: 'Modern reactive front-end framework',
  techDescTauri: 'Lightweight cross-platform desktop framework',
  techDescRust: 'High-performance system-level backend',
  techDescVite: 'Next-generation front-end build tool',
  techDescTailwind: 'Utility-first CSS framework',
};

const siteI18n = {
  en: siteI18nEn,
  'zh-CN': {
    ...siteI18nEn,
    navHome: '首页',
    navGuide: '使用手册',
    navChangelog: '版本说明',
    navPrivacy: '隐私政策',
    language: '语言',
    heroTagline: '跨平台 · 本地离线 · 注重隐私的轻量桌面工具集',
    heroMainlandPrefix: '以上为 GitHub 下载地址，速度可能较慢。中国大陆地区推荐',
    heroMainlandLink: '这里',
    heroChipUpdating: '持续更新中',
    mobileTip: '本应用为桌面端软件，请在电脑上访问下载',
    supportText: '支持 Apple 芯片的 Mac 和 Windows 10 及以上系统，暂不支持 Linux。',
    moreDownloads: '更多版本 →',
    featuresTitle: '功能特性',
    featuresSubtitle: '7 个实用工具，覆盖日常办公场景',
    techTitle: '技术栈',
    techSubtitle: '现代化的技术选型',
    faqTitle: '常见问题',
    faqMacTitle: 'macOS 提示「已损坏」或「无法验证开发者」怎么办？',
    faqMacDesc: '在终端中执行以下命令以移除隔离属性：',
    faqWindowsTitle: 'Windows 安装常见问题',
    faqWindowsDesc: '若 SmartScreen 提示风险，请点击「更多信息」后选择「仍要运行」。',
    guideTitle: '使用手册',
    guideSubtitle: '按步骤阅读，快速上手 7 个工具',
    changelogTitle: '版本说明',
    changelogSubtitle: '每次更新的详细记录',
    changelogFallback: '当前语言下的完整更新日志请查看 GitHub Releases。',
    downloadsTitle: '全部下载',
    downloadsSubtitle: '选择适合你系统的版本',
    downloadsLoading: '正在加载版本信息...',
    platformNoteTitle: '平台说明',
    platformNoteDesc: '本应用基于 Tauri 构建，UI 层依赖操作系统内置的 WebView 组件渲染：macOS 使用 WebKit（Safari 内核），Windows 使用 WebView2（Edge 内核）。',
    privacyTitle: '隐私政策',
    privacySubtitle: '我们如何保护你的隐私',
    privacyOverviewTitle: '概述',
    privacyOverviewDesc: '悠然工具箱完全本地运行，不收集、不上传、不存储用户数据。',
    privacyDataTitle: '数据处理',
    privacyDataItems: ['所有处理均在本地完成', '应用运行期间不发起网络请求', '不包含追踪代码或第三方分析'],
    privacyOpenSourceTitle: '开源透明',
    privacyOpenSourceDesc: '项目代码已开源，欢迎在 GitHub 查看。',
    footerRelease: '版本发布',
    footerIssues: '反馈问题',
    downloadMac: 'macOS 版',
    downloadWindows: 'Windows 版',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: '前往 GitHub',
    downloadArchAppleSilicon: 'Apple 芯片',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: '最新版本',
    githubAddress: 'GitHub 地址',
    aliyunAddress: '阿里云地址',
    historyVersions: '历史版本',
    historySummary: '个版本，点击展开',
    historySourceAliyun: '阿里云',
    noPackages: '暂无可用安装包',
    noVersions: '暂无可用版本',
    loadFailed: '加载失败，请',
    goGithub: '前往 GitHub 查看',
    aliyunFromVersion: '0.1.1 及以上版本提供阿里云下载',
    guideLiteHint: '该页面为精简说明，建议在应用内查看完整操作细节。',
    advCrossTitle: '跨平台支持',
    advCrossDesc: '原生支持 macOS 和 Windows 双平台，安装包体积轻巧，启动即用。',
    advOfflineTitle: '完全离线运行',
    advOfflineDesc: '所有功能均在本地运行，无需联网，不依赖任何云端服务。',
    advPrivacyTitle: '隐私优先',
    advPrivacyDesc: '不上传、不收集、不追踪，你的文件和数据始终只在本机。',
    advSimpleTitle: '简洁直观',
    advSimpleDesc: '精心打磨的界面设计，操作流程清晰简洁，零学习成本即可上手。',
    advThemeTitle: '亮暗主题',
    advThemeDesc: '支持亮色、暗色和跟随系统三种模式，搭配 16 种主题色自由切换。',
    advExperienceTitle: '体验至上',
    advExperienceDesc: '切换页面数据不丢失，窗口大小位置自动记忆，每处细节都经过打磨。',
    techDescSvelte: '新一代响应式前端框架',
    techDescTauri: '轻量跨平台桌面框架',
    techDescRust: '高性能系统级后端',
    techDescVite: '下一代前端构建工具',
    techDescTailwind: '原子化 CSS 框架',
  },
  'zh-TW': {
    ...siteI18nEn,
    navHome: '首頁',
    navGuide: '使用手冊',
    navChangelog: '版本說明',
    navPrivacy: '隱私政策',
    language: '語言',
    heroTagline: '跨平台 · 本地離線 · 注重隱私的輕量桌面工具集',
    heroMainlandPrefix: '以上為 GitHub 下載地址，速度可能較慢。中國大陸地區推薦',
    heroMainlandLink: '這裡',
    heroChipUpdating: '持續更新中',
    mobileTip: '本應用為桌面端軟體，請在電腦上訪問下載',
    supportText: '支援 Apple 晶片 Mac 和 Windows 10 及以上系統，暫不支援 Linux。',
    moreDownloads: '更多版本 →',
    featuresTitle: '功能特色',
    featuresSubtitle: '7 個實用工具，覆蓋日常辦公場景',
    techTitle: '技術棧',
    techSubtitle: '現代化技術選型',
    faqTitle: '常見問題',
    faqMacTitle: 'macOS 提示「已損壞」或「無法驗證開發者」怎麼辦？',
    faqMacDesc: '請在終端執行以下命令以移除隔離屬性：',
    faqWindowsTitle: 'Windows 安裝常見問題',
    faqWindowsDesc: '若 SmartScreen 提示風險，請點擊「更多資訊」後選擇「仍要執行」。',
    guideTitle: '使用手冊',
    guideSubtitle: '按步驟閱讀，快速上手 7 個工具',
    changelogTitle: '版本說明',
    changelogSubtitle: '每次更新的詳細記錄',
    changelogFallback: '目前語言的完整更新日誌請查看 GitHub Releases。',
    downloadsTitle: '全部下載',
    downloadsSubtitle: '選擇適合你系統的版本',
    downloadsLoading: '正在載入版本資訊...',
    platformNoteTitle: '平台說明',
    platformNoteDesc: '本應用基於 Tauri 建置，UI 層依賴作業系統內建的 WebView 元件渲染：macOS 使用 WebKit（Safari 核心），Windows 使用 WebView2（Edge 核心）。',
    privacyTitle: '隱私政策',
    privacySubtitle: '我們如何保護你的隱私',
    privacyOverviewTitle: '概述',
    privacyOverviewDesc: '悠然工具箱完全本地運行，不收集、不上傳、不儲存使用者資料。',
    privacyDataTitle: '資料處理',
    privacyDataItems: ['所有處理都在本地完成', '應用運行期間不會發起網路請求', '不包含追蹤程式碼或第三方分析'],
    privacyOpenSourceTitle: '開源透明',
    privacyOpenSourceDesc: '專案程式碼已開源，歡迎在 GitHub 查看。',
    footerRelease: '版本發布',
    footerIssues: '回報問題',
    downloadMac: 'macOS 版',
    downloadWindows: 'Windows 版',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: '前往 GitHub',
    downloadArchAppleSilicon: 'Apple 晶片',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: '最新版本',
    githubAddress: 'GitHub 地址',
    aliyunAddress: '阿里雲地址',
    historyVersions: '歷史版本',
    historySummary: '個版本，點擊展開',
    historySourceAliyun: '阿里雲',
    noPackages: '暫無可用安裝包',
    noVersions: '暫無可用版本',
    loadFailed: '載入失敗，請',
    goGithub: '前往 GitHub 查看',
    aliyunFromVersion: '0.1.1 及以上版本提供阿里雲下載',
    guideLiteHint: '此頁面為精簡說明，建議在應用內查看完整操作細節。',
    advCrossTitle: '跨平台支援',
    advCrossDesc: '原生支援 macOS 和 Windows 雙平台，安裝包輕巧，啟動即用。',
    advOfflineTitle: '完全離線運行',
    advOfflineDesc: '所有功能均在本地運行，無需聯網，不依賴任何雲端服務。',
    advPrivacyTitle: '隱私優先',
    advPrivacyDesc: '不上傳、不收集、不追蹤，你的檔案和資料始終只在本機。',
    advSimpleTitle: '簡潔直觀',
    advSimpleDesc: '精心打磨的介面與流程，幾乎零學習成本即可上手。',
    advThemeTitle: '亮暗主題',
    advThemeDesc: '支援亮色、暗色和跟隨系統三種模式，搭配 16 種主題色自由切換。',
    advExperienceTitle: '體驗至上',
    advExperienceDesc: '切換頁面資料不遺失，視窗大小與位置自動記憶。',
    techDescSvelte: '新一代響應式前端框架',
    techDescTauri: '輕量跨平台桌面框架',
    techDescRust: '高效能系統級後端',
    techDescVite: '新一代前端建置工具',
    techDescTailwind: '原子化 CSS 框架',
  },
  'ja-JP': {
    ...siteI18nEn,
    navHome: 'ホーム',
    navGuide: 'ガイド',
    navChangelog: '更新履歴',
    navPrivacy: 'プライバシー',
    language: '言語',
    heroTagline: 'クロスプラットフォーム · ローカル完結 · プライバシー重視のデスクトップツール集',
    heroMainlandPrefix: 'GitHub のダウンロードが遅い場合は',
    heroMainlandLink: 'こちら',
    heroChipUpdating: '継続的に追加予定',
    mobileTip: 'このアプリはデスクトップ専用です。PC でダウンロードしてください。',
    supportText: 'Apple Silicon 搭載 Mac と Windows 10 以降に対応しています。Linux は未対応です。',
    moreDownloads: 'その他のダウンロード →',
    featuresTitle: '機能',
    featuresSubtitle: '日常業務で使える 7 つのツール',
    techTitle: '技術スタック',
    techSubtitle: 'モダンな技術構成',
    faqTitle: 'よくある質問',
    faqMacTitle: 'macOS で「破損」や「未確認の開発元」と表示される場合',
    faqMacDesc: '隔離属性を削除するため、ターミナルで次のコマンドを実行してください。',
    faqWindowsTitle: 'Windows インストールのヒント',
    faqWindowsDesc: 'SmartScreen が表示された場合は、「詳細情報」→「実行」を選択してください。',
    guideTitle: 'ガイド',
    guideSubtitle: '7 つのツールをすぐに使い始める',
    changelogTitle: '更新履歴',
    changelogSubtitle: '更新内容の詳細',
    changelogFallback: 'この言語の完全な更新ノートは GitHub Releases を確認してください。',
    downloadsTitle: 'ダウンロード',
    downloadsSubtitle: 'お使いの OS に合うビルドを選択',
    downloadsLoading: 'リリース情報を読み込み中...',
    platformNoteTitle: 'プラットフォーム情報',
    platformNoteDesc: 'Tauri ベース。UI 層は OS 内蔵 WebView で描画され、macOS は WebKit（Safari エンジン）、Windows は WebView2（Edge エンジン）を使用します。',
    privacyTitle: 'プライバシーポリシー',
    privacySubtitle: 'プライバシー保護について',
    privacyOverviewTitle: '概要',
    privacyOverviewDesc: 'Youran Toolbox はローカルで動作し、データを収集・送信・保存しません。',
    privacyDataTitle: 'データ処理',
    privacyDataItems: ['処理はすべてローカルで実行', '通常利用時にネットワークリクエストは発生しない', 'トラッキングや第三者分析は含まない'],
    privacyOpenSourceTitle: 'オープンソース',
    privacyOpenSourceDesc: 'ソースコードは公開されており、GitHub で確認できます。',
    footerRelease: 'リリース',
    footerIssues: 'フィードバック',
    downloadMac: 'macOS 版',
    downloadWindows: 'Windows 版',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'GitHub へ',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: '最新',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: '過去バージョン',
    historySummary: '件、クリックで展開',
    historySourceAliyun: 'Aliyun',
    noPackages: '利用可能なインストーラーはありません',
    noVersions: '利用可能なバージョンはありません',
    loadFailed: '読み込みに失敗しました。',
    goGithub: 'GitHub で確認',
    aliyunFromVersion: 'Aliyun ダウンロードは 0.1.1 以降で提供されます',
    guideLiteHint: 'この言語のページは簡略版です。詳細はアプリ内ガイドをご確認ください。',
    advCrossTitle: 'クロスプラットフォーム',
    advCrossDesc: 'macOS と Windows に対応し、軽量で起動も高速です。',
    advOfflineTitle: '完全オフライン',
    advOfflineDesc: 'すべてローカル実行で、ネット接続は不要です。',
    advPrivacyTitle: 'プライバシー優先',
    advPrivacyDesc: 'アップロード・収集・追跡を行いません。',
    advSimpleTitle: 'シンプルな操作',
    advSimpleDesc: '分かりやすい UI と手順ですぐ使えます。',
    advThemeTitle: 'ライト / ダーク',
    advThemeDesc: 'ライト、ダーク、システム追従に対応します。',
    advExperienceTitle: '使いやすさ重視',
    advExperienceDesc: '細部まで整えた快適な操作体験を提供します。',
    techDescSvelte: 'モダンなリアクティブフロントエンドフレームワーク',
    techDescTauri: '軽量なクロスプラットフォームデスクトップフレームワーク',
    techDescRust: '高性能なシステムレベルバックエンド',
    techDescVite: '次世代フロントエンドビルドツール',
    techDescTailwind: 'ユーティリティファースト CSS フレームワーク',
  },
  'ko-KR': {
    ...siteI18nEn,
    navHome: '홈',
    navGuide: '가이드',
    navChangelog: '업데이트',
    navPrivacy: '개인정보',
    language: '언어',
    heroTagline: '크로스 플랫폼 · 로컬 중심 · 개인정보 중심의 데스크톱 도구 모음',
    heroMainlandPrefix: 'GitHub 다운로드가 느리다면',
    heroMainlandLink: '여기서 다운로드',
    heroChipUpdating: '계속 업데이트 예정',
    mobileTip: '이 앱은 데스크톱 전용입니다. PC 에서 다운로드해 주세요.',
    supportText: 'Apple Silicon Mac 및 Windows 10 이상을 지원합니다. Linux 는 아직 미지원입니다.',
    moreDownloads: '더 많은 다운로드 →',
    featuresTitle: '기능',
    featuresSubtitle: '일상 업무를 위한 7 가지 도구',
    techTitle: '기술 스택',
    techSubtitle: '현대적인 기술 선택',
    faqTitle: '자주 묻는 질문',
    faqMacTitle: 'macOS 에서 손상 또는 개발자 확인 불가가 표시될 때',
    faqMacDesc: '격리 속성을 제거하려면 터미널에서 아래 명령을 실행하세요.',
    faqWindowsTitle: 'Windows 설치 팁',
    faqWindowsDesc: 'SmartScreen 경고가 뜨면 "추가 정보" 후 "실행"을 선택하세요.',
    guideTitle: '가이드',
    guideSubtitle: '7 가지 도구 빠른 시작',
    changelogTitle: '업데이트',
    changelogSubtitle: '업데이트 내역',
    changelogFallback: '이 언어의 전체 릴리스 노트는 GitHub Releases 에서 확인하세요.',
    downloadsTitle: '다운로드',
    downloadsSubtitle: 'OS 에 맞는 빌드를 선택하세요',
    downloadsLoading: '릴리스 정보를 불러오는 중...',
    platformNoteTitle: '플랫폼 안내',
    platformNoteDesc: 'Tauri 기반이며 UI 계층은 운영체제 내장 WebView 로 렌더링됩니다. macOS 는 WebKit (Safari 엔진), Windows 는 WebView2 (Edge 엔진) 를 사용합니다.',
    privacyTitle: '개인정보 처리방침',
    privacySubtitle: '개인정보 보호 방식',
    privacyOverviewTitle: '개요',
    privacyOverviewDesc: 'Youran Toolbox 는 로컬에서 실행되며 데이터를 수집, 업로드, 저장하지 않습니다.',
    privacyDataTitle: '데이터 처리',
    privacyDataItems: ['모든 처리는 로컬에서 수행', '일반 사용 중 네트워크 요청 없음', '추적 코드 및 타사 분석 없음'],
    privacyOpenSourceTitle: '오픈소스',
    privacyOpenSourceDesc: '소스 코드는 공개되어 있으며 GitHub 에서 확인할 수 있습니다.',
    footerRelease: '릴리스',
    footerIssues: '이슈',
    downloadMac: 'macOS',
    downloadWindows: 'Windows',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'GitHub 이동',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: '최신 버전',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: '이전 버전',
    historySummary: '개 버전, 클릭하여 펼치기',
    historySourceAliyun: 'Aliyun',
    noPackages: '사용 가능한 설치 파일이 없습니다',
    noVersions: '사용 가능한 버전이 없습니다',
    loadFailed: '불러오기에 실패했습니다.',
    goGithub: 'GitHub 에서 보기',
    aliyunFromVersion: 'Aliyun 다운로드는 0.1.1 버전부터 제공됩니다',
    guideLiteHint: '이 페이지는 간략 버전입니다. 자세한 내용은 앱 내 가이드를 확인하세요.',
    advCrossTitle: '크로스 플랫폼',
    advCrossDesc: 'macOS 와 Windows 를 기본 지원하며 가볍고 빠릅니다.',
    advOfflineTitle: '완전 오프라인',
    advOfflineDesc: '모든 기능이 로컬에서 동작하며 인터넷이 필요 없습니다.',
    advPrivacyTitle: '개인정보 우선',
    advPrivacyDesc: '업로드, 수집, 추적을 하지 않습니다.',
    advSimpleTitle: '간결한 사용성',
    advSimpleDesc: '직관적인 인터페이스와 흐름으로 쉽게 사용할 수 있습니다.',
    advThemeTitle: '라이트 / 다크',
    advThemeDesc: '라이트, 다크, 시스템 모드를 지원합니다.',
    advExperienceTitle: '완성도 높은 경험',
    advExperienceDesc: '세부 요소까지 다듬은 사용자 경험을 제공합니다.',
    techDescSvelte: '현대적인 반응형 프런트엔드 프레임워크',
    techDescTauri: '경량 크로스 플랫폼 데스크톱 프레임워크',
    techDescRust: '고성능 시스템 레벨 백엔드',
    techDescVite: '차세대 프런트엔드 빌드 도구',
    techDescTailwind: '유틸리티 우선 CSS 프레임워크',
  },
  'fr-FR': {
    ...siteI18nEn,
    navHome: 'Accueil',
    navGuide: 'Guide',
    navChangelog: 'Nouveautés',
    navPrivacy: 'Confidentialité',
    language: 'Langue',
    heroTagline: 'Multi-plateforme · Local · Respect de la vie privée',
    heroMainlandPrefix: 'Si GitHub est lent en Chine continentale, utilisez',
    heroMainlandLink: 'ce lien',
    heroChipUpdating: 'Encore plus à venir',
    mobileTip: 'Application de bureau uniquement. Veuillez télécharger sur ordinateur.',
    supportText: 'Compatible Mac Apple Silicon et Windows 10+. Linux non pris en charge pour le moment.',
    moreDownloads: 'Plus de téléchargements →',
    featuresTitle: 'Fonctionnalités',
    featuresSubtitle: '7 outils pratiques pour le quotidien',
    techTitle: 'Stack technique',
    techSubtitle: 'Choix techniques modernes',
    faqTitle: 'FAQ',
    faqMacTitle: 'macOS indique application endommagée ou non vérifiée ?',
    faqMacDesc: 'Exécutez la commande suivante dans le Terminal pour retirer la quarantaine :',
    faqWindowsTitle: 'Conseils d’installation Windows',
    faqWindowsDesc: 'Si SmartScreen bloque, cliquez sur "Informations complémentaires" puis "Exécuter quand même".',
    guideTitle: 'Guide',
    guideSubtitle: 'Prise en main rapide des 7 outils',
    changelogTitle: 'Nouveautés',
    changelogSubtitle: 'Historique des mises à jour',
    changelogFallback: 'Pour les notes complètes dans cette langue, consultez GitHub Releases.',
    downloadsTitle: 'Téléchargements',
    downloadsSubtitle: 'Choisissez la version adaptée à votre OS',
    downloadsLoading: 'Chargement des informations de version...',
    platformNoteTitle: 'Notes de plateforme',
    platformNoteDesc: 'Construit avec Tauri. La couche UI repose sur le WebView intégré du système : macOS utilise WebKit (moteur Safari), Windows utilise WebView2 (moteur Edge).',
    privacyTitle: 'Politique de confidentialité',
    privacySubtitle: 'Comment nous protégeons votre vie privée',
    privacyOverviewTitle: 'Vue d’ensemble',
    privacyOverviewDesc: 'Youran Toolbox fonctionne en local et ne collecte, n’envoie ni ne stocke vos données.',
    privacyDataTitle: 'Traitement des données',
    privacyDataItems: ['Tout est traité localement', 'Aucune requête réseau en usage normal', 'Aucun suivi ni analyse tierce'],
    privacyOpenSourceTitle: 'Open source',
    privacyOpenSourceDesc: 'Le code source est public sur GitHub.',
    footerRelease: 'Releases',
    footerIssues: 'Issues',
    downloadMac: 'macOS',
    downloadWindows: 'Windows',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'Aller sur GitHub',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: 'Dernière version',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: 'Versions précédentes',
    historySummary: 'versions, cliquer pour déplier',
    historySourceAliyun: 'Aliyun',
    noPackages: 'Aucun installateur disponible',
    noVersions: 'Aucune version disponible',
    loadFailed: 'Échec du chargement. Veuillez',
    goGithub: 'voir sur GitHub',
    aliyunFromVersion: 'Les téléchargements Aliyun sont disponibles à partir de 0.1.1',
    guideLiteHint: 'Cette page est simplifiée dans cette langue. Voir le guide complet dans l’application.',
    advCrossTitle: 'Multi-plateforme',
    advCrossDesc: 'Prise en charge native de macOS et Windows, installation légère et rapide.',
    advOfflineTitle: 'Entièrement hors ligne',
    advOfflineDesc: 'Toutes les fonctions s’exécutent en local, sans dépendance réseau.',
    advPrivacyTitle: 'Vie privée d’abord',
    advPrivacyDesc: 'Aucun envoi, aucune collecte, aucun suivi.',
    advSimpleTitle: 'Simple et clair',
    advSimpleDesc: 'Interface soignée et flux clairs pour démarrer rapidement.',
    advThemeTitle: 'Thèmes clair / sombre',
    advThemeDesc: 'Prend en charge clair, sombre et suivi du système.',
    advExperienceTitle: 'Expérience soignée',
    advExperienceDesc: 'Des détails pensés pour un usage quotidien confortable.',
    techDescSvelte: 'Framework front-end réactif moderne',
    techDescTauri: 'Framework desktop multi-plateforme léger',
    techDescRust: 'Backend système haute performance',
    techDescVite: 'Outil de build front-end nouvelle génération',
    techDescTailwind: 'Framework CSS utilitaire',
  },
  'de-DE': {
    ...siteI18nEn,
    navHome: 'Start',
    navGuide: 'Anleitung',
    navChangelog: 'Änderungen',
    navPrivacy: 'Datenschutz',
    language: 'Sprache',
    heroTagline: 'Plattformübergreifend · Lokal · Datenschutzorientiert',
    heroMainlandPrefix: 'Wenn GitHub in Festlandchina langsam ist, nutzen Sie',
    heroMainlandLink: 'diesen Link',
    heroChipUpdating: 'Weitere folgen',
    mobileTip: 'Diese App ist nur für Desktop. Bitte am Computer herunterladen.',
    supportText: 'Unterstützt Apple Silicon Mac und Windows 10+. Linux wird derzeit nicht unterstützt.',
    moreDownloads: 'Weitere Downloads →',
    featuresTitle: 'Funktionen',
    featuresSubtitle: '7 praktische Tools für den Alltag',
    techTitle: 'Technologie',
    techSubtitle: 'Moderne technische Basis',
    faqTitle: 'FAQ',
    faqMacTitle: 'macOS meldet beschädigt oder nicht verifiziert?',
    faqMacDesc: 'Führen Sie den folgenden Befehl im Terminal aus, um Quarantäne zu entfernen:',
    faqWindowsTitle: 'Windows Installationshinweise',
    faqWindowsDesc: 'Wenn SmartScreen blockiert, klicken Sie auf "Weitere Informationen" und dann auf "Trotzdem ausführen".',
    guideTitle: 'Anleitung',
    guideSubtitle: 'Schnellstart für 7 Tools',
    changelogTitle: 'Änderungen',
    changelogSubtitle: 'Detaillierte Update-Historie',
    changelogFallback: 'Vollständige Release Notes in dieser Sprache finden Sie bei GitHub Releases.',
    downloadsTitle: 'Downloads',
    downloadsSubtitle: 'Wählen Sie die passende Version für Ihr System',
    downloadsLoading: 'Lade Versionsinformationen...',
    platformNoteTitle: 'Plattformhinweise',
    platformNoteDesc: 'Basiert auf Tauri. Die UI wird über das systemeigene WebView gerendert: macOS nutzt WebKit (Safari Engine), Windows nutzt WebView2 (Edge Engine).',
    privacyTitle: 'Datenschutzerklärung',
    privacySubtitle: 'So schützen wir Ihre Daten',
    privacyOverviewTitle: 'Überblick',
    privacyOverviewDesc: 'Youran Toolbox läuft lokal und sammelt, überträgt oder speichert keine Nutzerdaten.',
    privacyDataTitle: 'Datenverarbeitung',
    privacyDataItems: ['Alle Verarbeitung erfolgt lokal', 'Keine Netzwerkanfragen bei normaler Nutzung', 'Kein Tracking oder Drittanbieter-Analyse'],
    privacyOpenSourceTitle: 'Open Source',
    privacyOpenSourceDesc: 'Der Quellcode ist offen und auf GitHub einsehbar.',
    footerRelease: 'Releases',
    footerIssues: 'Issues',
    downloadMac: 'macOS',
    downloadWindows: 'Windows',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'Zu GitHub',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: 'Neueste Version',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: 'Frühere Versionen',
    historySummary: 'Versionen, zum Aufklappen klicken',
    historySourceAliyun: 'Aliyun',
    noPackages: 'Kein Installer verfügbar',
    noVersions: 'Keine Version verfügbar',
    loadFailed: 'Laden fehlgeschlagen. Bitte',
    goGithub: 'auf GitHub ansehen',
    aliyunFromVersion: 'Aliyun Downloads sind ab Version 0.1.1 verfügbar',
    guideLiteHint: 'Diese Seite ist in dieser Sprache vereinfacht. Vollständige Details finden Sie in der App.',
    advCrossTitle: 'Plattformübergreifend',
    advCrossDesc: 'Native Unterstützung für macOS und Windows, leicht und schnell startklar.',
    advOfflineTitle: 'Komplett offline',
    advOfflineDesc: 'Alle Funktionen laufen lokal, ohne Cloud-Abhängigkeit.',
    advPrivacyTitle: 'Datenschutz zuerst',
    advPrivacyDesc: 'Kein Upload, keine Erfassung, kein Tracking.',
    advSimpleTitle: 'Einfach und klar',
    advSimpleDesc: 'Sauberes Design und klare Abläufe, schnell erlernbar.',
    advThemeTitle: 'Hell und dunkel',
    advThemeDesc: 'Unterstützt hell, dunkel und Systemmodus.',
    advExperienceTitle: 'Feinschliff',
    advExperienceDesc: 'Viele kleine Details sorgen für eine bessere Nutzung.',
    techDescSvelte: 'Modernes reaktives Frontend-Framework',
    techDescTauri: 'Leichtgewichtiges Desktop-Framework für mehrere Plattformen',
    techDescRust: 'Leistungsstarkes systemnahes Backend',
    techDescVite: 'Frontend-Build-Tool der nächsten Generation',
    techDescTailwind: 'Utility-first CSS Framework',
  },
  'es-ES': {
    ...siteI18nEn,
    navHome: 'Inicio',
    navGuide: 'Guía',
    navChangelog: 'Novedades',
    navPrivacy: 'Privacidad',
    language: 'Idioma',
    heroTagline: 'Multiplataforma · Local · Enfoque en privacidad',
    heroMainlandPrefix: 'Si GitHub va lento en China continental, usa',
    heroMainlandLink: 'este enlace',
    heroChipUpdating: 'Más funciones en camino',
    mobileTip: 'Esta app es solo para escritorio. Descárgala en una computadora.',
    supportText: 'Compatible con Mac Apple Silicon y Windows 10+. Linux aún no está disponible.',
    moreDownloads: 'Más descargas →',
    featuresTitle: 'Funciones',
    featuresSubtitle: '7 herramientas prácticas para el trabajo diario',
    techTitle: 'Tecnología',
    techSubtitle: 'Stack moderno',
    faqTitle: 'Preguntas frecuentes',
    faqMacTitle: '¿macOS dice que la app está dañada o no verificada?',
    faqMacDesc: 'Ejecuta este comando en Terminal para quitar la cuarentena:',
    faqWindowsTitle: 'Consejos de instalación en Windows',
    faqWindowsDesc: 'Si SmartScreen bloquea el instalador, pulsa "Más información" y luego "Ejecutar de todas formas".',
    guideTitle: 'Guía',
    guideSubtitle: 'Inicio rápido de 7 herramientas',
    changelogTitle: 'Novedades',
    changelogSubtitle: 'Historial de actualizaciones',
    changelogFallback: 'Para notas completas en este idioma, consulta GitHub Releases.',
    downloadsTitle: 'Descargas',
    downloadsSubtitle: 'Elige la versión para tu sistema',
    downloadsLoading: 'Cargando información de versiones...',
    platformNoteTitle: 'Notas de plataforma',
    platformNoteDesc: 'Construido con Tauri. La capa UI se renderiza con el WebView integrado del sistema: macOS usa WebKit (motor Safari) y Windows usa WebView2 (motor Edge).',
    privacyTitle: 'Política de privacidad',
    privacySubtitle: 'Cómo protegemos tu privacidad',
    privacyOverviewTitle: 'Resumen',
    privacyOverviewDesc: 'Youran Toolbox funciona en local y no recopila, sube ni almacena datos de usuario.',
    privacyDataTitle: 'Tratamiento de datos',
    privacyDataItems: ['Todo el procesamiento es local', 'Sin solicitudes de red en uso normal', 'Sin rastreo ni analítica de terceros'],
    privacyOpenSourceTitle: 'Código abierto',
    privacyOpenSourceDesc: 'El código fuente es público y está en GitHub.',
    footerRelease: 'Releases',
    footerIssues: 'Issues',
    downloadMac: 'macOS',
    downloadWindows: 'Windows',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'Ir a GitHub',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: 'Última versión',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: 'Versiones anteriores',
    historySummary: 'versiones, haz clic para expandir',
    historySourceAliyun: 'Aliyun',
    noPackages: 'No hay instalador disponible',
    noVersions: 'No hay versiones disponibles',
    loadFailed: 'Error al cargar. Por favor',
    goGithub: 'ver en GitHub',
    aliyunFromVersion: 'Las descargas de Aliyun están disponibles desde la versión 0.1.1',
    guideLiteHint: 'Esta página está simplificada en este idioma. Para más detalle, revisa la guía en la app.',
    advCrossTitle: 'Multiplataforma',
    advCrossDesc: 'Soporte nativo para macOS y Windows, instalador ligero y rápido.',
    advOfflineTitle: 'Totalmente offline',
    advOfflineDesc: 'Todo funciona en local, sin dependencia de la nube.',
    advPrivacyTitle: 'Privacidad primero',
    advPrivacyDesc: 'Sin subida, sin recopilación y sin seguimiento.',
    advSimpleTitle: 'Simple y claro',
    advSimpleDesc: 'Interfaz cuidada y flujos claros para empezar rápido.',
    advThemeTitle: 'Claro y oscuro',
    advThemeDesc: 'Soporta modo claro, oscuro y seguir al sistema.',
    advExperienceTitle: 'Experiencia pulida',
    advExperienceDesc: 'Detalles bien trabajados en toda la experiencia.',
    techDescSvelte: 'Framework front-end reactivo moderno',
    techDescTauri: 'Framework de escritorio multiplataforma ligero',
    techDescRust: 'Backend de sistema de alto rendimiento',
    techDescVite: 'Herramienta de build front-end de nueva generación',
    techDescTailwind: 'Framework CSS utility-first',
  },
  'it-IT': {
    ...siteI18nEn,
    navHome: 'Home',
    navGuide: 'Guida',
    navChangelog: 'Novità',
    navPrivacy: 'Privacy',
    language: 'Lingua',
    heroTagline: 'Multipiattaforma · Locale · Attento alla privacy',
    heroMainlandPrefix: 'Se GitHub è lento nella Cina continentale, usa',
    heroMainlandLink: 'questo link',
    heroChipUpdating: 'Altre funzioni in arrivo',
    mobileTip: 'Questa app è solo desktop. Scaricala da un computer.',
    supportText: 'Supporta Mac Apple Silicon e Windows 10+. Linux non è ancora supportato.',
    moreDownloads: 'Altri download →',
    featuresTitle: 'Funzionalità',
    featuresSubtitle: '7 strumenti pratici per il lavoro quotidiano',
    techTitle: 'Stack tecnico',
    techSubtitle: 'Tecnologie moderne',
    faqTitle: 'FAQ',
    faqMacTitle: 'macOS indica app danneggiata o sviluppatore non verificato?',
    faqMacDesc: 'Esegui questo comando nel Terminale per rimuovere la quarantena:',
    faqWindowsTitle: 'Suggerimenti installazione Windows',
    faqWindowsDesc: 'Se SmartScreen blocca il setup, clicca "Altre informazioni" e poi "Esegui comunque".',
    guideTitle: 'Guida',
    guideSubtitle: 'Avvio rapido dei 7 strumenti',
    changelogTitle: 'Novità',
    changelogSubtitle: 'Cronologia aggiornamenti',
    changelogFallback: 'Per le note complete in questa lingua, consulta GitHub Releases.',
    downloadsTitle: 'Download',
    downloadsSubtitle: 'Scegli la build adatta al tuo sistema',
    downloadsLoading: 'Caricamento informazioni versione...',
    platformNoteTitle: 'Note piattaforma',
    platformNoteDesc: 'Basato su Tauri. Il livello UI viene renderizzato tramite il WebView integrato del sistema: macOS usa WebKit (motore Safari), Windows usa WebView2 (motore Edge).',
    privacyTitle: 'Informativa sulla privacy',
    privacySubtitle: 'Come proteggiamo la tua privacy',
    privacyOverviewTitle: 'Panoramica',
    privacyOverviewDesc: 'Youran Toolbox funziona in locale e non raccoglie, carica o memorizza dati utente.',
    privacyDataTitle: 'Gestione dati',
    privacyDataItems: ['Elaborazione completamente locale', 'Nessuna richiesta di rete durante l’uso normale', 'Nessun tracciamento o analisi di terze parti'],
    privacyOpenSourceTitle: 'Open source',
    privacyOpenSourceDesc: 'Il codice sorgente è pubblico su GitHub.',
    footerRelease: 'Releases',
    footerIssues: 'Issues',
    downloadMac: 'macOS',
    downloadWindows: 'Windows',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'Vai su GitHub',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: 'Ultima versione',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: 'Versioni precedenti',
    historySummary: 'versioni, clicca per espandere',
    historySourceAliyun: 'Aliyun',
    noPackages: 'Nessun installer disponibile',
    noVersions: 'Nessuna versione disponibile',
    loadFailed: 'Caricamento non riuscito. Per favore',
    goGithub: 'apri GitHub',
    aliyunFromVersion: 'I download Aliyun sono disponibili dalla versione 0.1.1',
    guideLiteHint: 'Questa pagina è semplificata in questa lingua. Per i dettagli completi usa la guida nell’app.',
    advCrossTitle: 'Multipiattaforma',
    advCrossDesc: 'Supporto nativo per macOS e Windows, leggero e pronto all’uso.',
    advOfflineTitle: 'Completamente offline',
    advOfflineDesc: 'Tutte le funzioni girano in locale senza dipendenze cloud.',
    advPrivacyTitle: 'Privacy prima di tutto',
    advPrivacyDesc: 'Nessun upload, nessuna raccolta, nessun tracciamento.',
    advSimpleTitle: 'Semplice e chiaro',
    advSimpleDesc: 'Interfaccia curata e flussi chiari per iniziare subito.',
    advThemeTitle: 'Chiaro e scuro',
    advThemeDesc: 'Supporta tema chiaro, scuro e modalità sistema.',
    advExperienceTitle: 'Esperienza curata',
    advExperienceDesc: 'Dettagli rifiniti per un uso quotidiano più fluido.',
    techDescSvelte: 'Framework front-end reattivo moderno',
    techDescTauri: 'Framework desktop multipiattaforma leggero',
    techDescRust: 'Backend di sistema ad alte prestazioni',
    techDescVite: 'Strumento di build front-end di nuova generazione',
    techDescTailwind: 'Framework CSS utility-first',
  },
  'ru-RU': {
    ...siteI18nEn,
    navHome: 'Главная',
    navGuide: 'Руководство',
    navChangelog: 'Обновления',
    navPrivacy: 'Конфиденциальность',
    language: 'Язык',
    heroTagline: 'Кроссплатформенно · Локально · С акцентом на приватность',
    heroMainlandPrefix: 'Если GitHub медленный в материковом Китае, используйте',
    heroMainlandLink: 'эту ссылку',
    heroChipUpdating: 'Скоро больше функций',
    mobileTip: 'Приложение только для ПК. Скачайте с компьютера.',
    supportText: 'Поддерживаются Mac на Apple Silicon и Windows 10+. Linux пока не поддерживается.',
    moreDownloads: 'Больше загрузок →',
    featuresTitle: 'Функции',
    featuresSubtitle: '7 практичных инструментов для повседневной работы',
    techTitle: 'Технологии',
    techSubtitle: 'Современный стек',
    faqTitle: 'Частые вопросы',
    faqMacTitle: 'macOS сообщает, что приложение повреждено или не проверено?',
    faqMacDesc: 'Выполните команду в Terminal, чтобы снять карантин:',
    faqWindowsTitle: 'Советы по установке в Windows',
    faqWindowsDesc: 'Если SmartScreen блокирует установщик, нажмите "Подробнее", затем "Все равно выполнить".',
    guideTitle: 'Руководство',
    guideSubtitle: 'Быстрый старт 7 инструментов',
    changelogTitle: 'Обновления',
    changelogSubtitle: 'История изменений',
    changelogFallback: 'Полные заметки к релизам на этом языке смотрите в GitHub Releases.',
    downloadsTitle: 'Загрузки',
    downloadsSubtitle: 'Выберите сборку для вашей ОС',
    downloadsLoading: 'Загрузка информации о версиях...',
    platformNoteTitle: 'Информация о платформе',
    platformNoteDesc: 'Приложение построено на Tauri. UI слой рендерится через встроенный системный WebView: в macOS используется WebKit (движок Safari), в Windows — WebView2 (движок Edge).',
    privacyTitle: 'Политика конфиденциальности',
    privacySubtitle: 'Как мы защищаем вашу приватность',
    privacyOverviewTitle: 'Обзор',
    privacyOverviewDesc: 'Youran Toolbox работает локально и не собирает, не загружает и не хранит данные пользователя.',
    privacyDataTitle: 'Обработка данных',
    privacyDataItems: ['Вся обработка выполняется локально', 'Нет сетевых запросов при обычном использовании', 'Нет трекинга и сторонней аналитики'],
    privacyOpenSourceTitle: 'Открытый код',
    privacyOpenSourceDesc: 'Исходный код открыт и доступен на GitHub.',
    footerRelease: 'Релизы',
    footerIssues: 'Issues',
    downloadMac: 'macOS',
    downloadWindows: 'Windows',
    downloadMacShort: 'macOS',
    downloadWindowsShort: 'Windows',
    downloadWindowsMsiShort: 'Windows (MSI)',
    downloadGithub: 'Открыть GitHub',
    downloadArchAppleSilicon: 'Apple Silicon',
    downloadArchX64: 'x64',
    downloadSizeUnitMb: 'MB',
    latestVersion: 'Последняя версия',
    githubAddress: 'GitHub',
    aliyunAddress: 'Aliyun',
    historyVersions: 'Предыдущие версии',
    historySummary: 'версий, нажмите для раскрытия',
    historySourceAliyun: 'Aliyun',
    noPackages: 'Нет доступных установщиков',
    noVersions: 'Нет доступных версий',
    loadFailed: 'Не удалось загрузить. Пожалуйста,',
    goGithub: 'смотрите на GitHub',
    aliyunFromVersion: 'Загрузки с Aliyun доступны начиная с версии 0.1.1',
    guideLiteHint: 'Эта страница в данном языке упрощена. Полные детали смотрите в приложении.',
    advCrossTitle: 'Кроссплатформенность',
    advCrossDesc: 'Нативная поддержка macOS и Windows, легкая установка и быстрый запуск.',
    advOfflineTitle: 'Полностью офлайн',
    advOfflineDesc: 'Все функции работают локально без зависимости от сети.',
    advPrivacyTitle: 'Приватность прежде всего',
    advPrivacyDesc: 'Без загрузки, без сбора, без отслеживания.',
    advSimpleTitle: 'Просто и понятно',
    advSimpleDesc: 'Чистый интерфейс и понятные сценарии использования.',
    advThemeTitle: 'Светлая и тёмная темы',
    advThemeDesc: 'Поддерживаются светлая, тёмная и системная темы.',
    advExperienceTitle: 'Продуманный UX',
    advExperienceDesc: 'Множество мелких улучшений для комфортной работы.',
    techDescSvelte: 'Современный реактивный фронтенд-фреймворк',
    techDescTauri: 'Легковесный кроссплатформенный desktop-фреймворк',
    techDescRust: 'Высокопроизводительный системный backend',
    techDescVite: 'Инструмент сборки фронтенда нового поколения',
    techDescTailwind: 'Utility-first CSS фреймворк',
  },
};

const siteI18nEnhancements = {
  en: {
    guideIntroTitle: 'Start here',
    guideIntroSteps: ['Read "Workflow" first and run one quick pass.', 'Open "Common settings" only when needed.', 'Test with a small sample before batch processing.'],
    guideJumpTitle: 'Quick jump',
    guideSectionCore: 'Core capabilities',
    guideSectionWorkflow: 'Workflow',
    guideSectionSettings: 'Common settings (expand as needed)',
    guideSectionTips: 'Tips',
  guideResultLabel: 'Result:',
  guideSourceData: 'Source data',
  guideClassifiedAfterPrefix: 'Classified by',
  guideItemUnit: 'items',
    genericHighlights: ['Local processing with privacy protection', 'Fast and lightweight desktop workflow', 'Clear and easy-to-use interactions'],
    genericWorkflow: ['Open the tool page', 'Configure required options', 'Review results in real time', 'Run and save output'],
    genericSettingsTitle: 'Common settings',
    genericSettingsItems: ['Choose input files or data first', 'Adjust output mode and related options', 'Review preview before executing'],
    genericTips: ['Try with a small sample first', 'Use copy mode when you need to keep originals'],
    genericPreviewTitle: 'Feature preview',
    genericPreviewTool: 'Tool: {name}',
    genericPreviewSafe: 'Local processing · No cloud upload',
    genericBeforeLabel: 'Before',
    genericAfterLabel: 'After',
    faqMacExplain: 'On macOS, apps downloaded from the internet may be marked with quarantine attributes. If the app is blocked, use the commands below.',
    faqMacCmdHint1: 'Recommended command (remove quarantine only):',
    faqMacCmd2: 'xattr -cr "/Applications/Youran Toolbox.app"',
    faqMacCmdHint2: 'If it still cannot open, run (clear all extended attributes):',
    faqMacPathNote: 'Replace the path with the actual app path on your Mac.',
    faqWindowsIntro: 'On Windows, you may encounter the following during installation:',
    faqWindowsItems: ['If SmartScreen says "Windows protected your PC", click "More info" then "Run anyway".', 'If permissions are insufficient, run the installer as Administrator.', 'If antivirus blocks the installer, add it to allow list and retry.', 'Recommended system: Windows 10 (1803+) or Windows 11 x64.'],
    privacyFileAccessTitle: 'File Access',
    privacyFileAccessItems: ['The app accesses files only when you select them', 'Processed files are saved only to your chosen location'],
    privacyUpdateTitle: 'Policy Updates',
    privacyUpdateDesc: 'This privacy policy may be updated with new releases. Changes will be published on this page.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Only supports Apple Silicon (M1 and newer). WebKit is provided by the system.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Supports Windows 10 (1803+) and Windows 11 x64. WebView2 runtime is preinstalled.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri depends on WebKitGTK. Different distributions have inconsistent WebKit versions, so official builds are not provided for now.',
  },
  'zh-CN': {
    guideIntroTitle: '先看这里',
    guideIntroSteps: ['先看「使用流程」，按步骤做一遍。', '遇到细节问题，再展开「常用设置」。', '先用少量文件测试，再批量处理正式文件。'],
    guideJumpTitle: '快速跳转',
    guideSectionCore: '核心能力',
    guideSectionWorkflow: '使用流程',
    guideSectionSettings: '常用设置（按需展开）',
    guideSectionTips: '使用建议',
    guideResultLabel: '结果：',
    guideSourceData: '原始数据',
    guideClassifiedAfterPrefix: '按',
    guideItemUnit: '条',
    genericHighlights: ['本地处理，保障隐私安全', '桌面端流程轻量高效', '交互清晰，上手成本低'],
    genericWorkflow: ['进入对应工具页面', '配置所需参数', '实时预览处理结果', '执行并保存输出'],
    genericSettingsTitle: '常用设置',
    genericSettingsItems: ['先选择输入文件或数据', '按需调整输出模式和参数', '执行前先检查预览结果'],
    genericTips: ['建议先用少量样本验证结果', '需要保留原文件时请优先使用复制模式'],
    genericPreviewTitle: '功能预览',
    genericPreviewTool: '当前工具：{name}',
    genericPreviewSafe: '本地处理 · 不上传云端',
    genericBeforeLabel: '处理前',
    genericAfterLabel: '处理后',
    faqMacExplain: '在 macOS 上，从网络下载的应用可能会被系统打上隔离属性。若应用被拦截，可按以下命令处理。',
    faqMacCmdHint1: '建议先执行（仅移除隔离属性）：',
    faqMacCmd2: 'xattr -cr "/Applications/Youran Toolbox.app"',
    faqMacCmdHint2: '如果仍然无法打开，再执行（清空全部扩展属性）：',
    faqMacPathNote: '请将路径替换为你本机的实际应用路径。',
    faqWindowsIntro: 'Windows 安装一般不会出现 macOS 的相关提示，但可能会遇到以下情况：',
    faqWindowsItems: ['SmartScreen 提示风险时，请点击「更多信息」后选择「仍要运行」。', '安装权限不足时，建议右键安装程序选择「以管理员身份运行」。', '若安全软件拦截，请加入白名单后重试。', '建议使用 Windows 10（1803+）或 Windows 11 的 x64 系统。'],
    privacyFileAccessTitle: '文件访问',
    privacyFileAccessItems: ['应用仅在你主动选择文件时访问对应文件', '处理结果仅保存到你指定的位置'],
    privacyUpdateTitle: '更新说明',
    privacyUpdateDesc: '本隐私政策可能随应用更新而调整，任何变更都会在此页面公布。',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: '仅支持 Apple Silicon 芯片（M1 及以上），WebKit 由系统提供，无需额外安装。',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: '支持 Windows 10（1803+）及 Windows 11 的 x64 系统，WebView2 运行时通常已预装。',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri 依赖 WebKitGTK，不同发行版的 WebKit 版本差异较大，暂不提供官方构建。',
  },
  'zh-TW': {
    guideIntroTitle: '先看這裡',
    guideIntroSteps: ['先看「使用流程」，按步驟做一遍。', '遇到細節問題，再展開「常用設定」。', '先用少量檔案測試，再批量處理正式檔案。'],
    guideJumpTitle: '快速跳轉',
    guideSectionCore: '核心能力',
    guideSectionWorkflow: '使用流程',
    guideSectionSettings: '常用設定（按需展開）',
    guideSectionTips: '使用建議',
    guideResultLabel: '結果：',
    guideSourceData: '原始資料',
    guideClassifiedAfterPrefix: '按',
    guideItemUnit: '筆',
    genericHighlights: ['本地處理，保障隱私安全', '桌面端流程輕量高效', '操作清晰，容易上手'],
    genericWorkflow: ['進入對應工具頁面', '設定所需參數', '即時預覽處理結果', '執行並儲存輸出'],
    genericSettingsTitle: '常用設定',
    genericSettingsItems: ['先選擇輸入檔案或資料', '按需調整輸出模式與參數', '執行前先檢查預覽結果'],
    genericTips: ['建議先用少量樣本驗證結果', '需要保留原檔時，優先使用複製模式'],
    genericPreviewTitle: '功能預覽',
    genericPreviewTool: '當前工具：{name}',
    genericPreviewSafe: '本地處理 · 不上傳雲端',
    genericBeforeLabel: '處理前',
    genericAfterLabel: '處理後',
    faqMacExplain: '在 macOS 上，從網路下載的應用可能會被系統加上隔離屬性。若應用被攔截，可使用以下命令。',
    faqMacCmdHint1: '建議先執行（僅移除隔離屬性）：',
    faqMacCmdHint2: '若仍無法開啟，再執行（清除全部擴展屬性）：',
    faqMacPathNote: '請將路徑替換為你本機的實際應用路徑。',
    faqWindowsIntro: 'Windows 安裝通常不會出現 macOS 的相關提示，但可能會遇到以下情況：',
    faqWindowsItems: ['若 SmartScreen 提示風險，請點擊「更多資訊」後選擇「仍要執行」。', '若安裝權限不足，建議以系統管理員身分執行安裝程式。', '若安全軟體攔截，請加入白名單後重試。', '建議使用 Windows 10（1803+）或 Windows 11 的 x64 系統。'],
    privacyFileAccessTitle: '檔案存取',
    privacyFileAccessItems: ['應用僅在你主動選擇檔案時才會存取', '處理結果只會儲存到你指定的位置'],
    privacyUpdateTitle: '更新說明',
    privacyUpdateDesc: '本隱私政策可能隨應用更新而調整，任何變更都會在此頁面公布。',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: '僅支援 Apple Silicon 晶片（M1 及以上），WebKit 由系統提供，無需額外安裝。',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: '支援 Windows 10（1803+）及 Windows 11 的 x64 系統，WebView2 執行階段通常已預先安裝。',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri 依賴 WebKitGTK，不同發行版的 WebKit 版本差異較大，暫不提供官方建置。',
  },
  'ja-JP': {
    guideIntroTitle: '最初にここを確認',
    guideIntroSteps: ['まず「ワークフロー」を見て 1 回試します。', '細かい調整が必要な場合は「共通設定」を開きます。', '本番前に少量データで確認します。'],
    guideJumpTitle: 'クイックジャンプ',
    guideSectionCore: '主な機能',
    guideSectionWorkflow: 'ワークフロー',
    guideSectionSettings: '共通設定（必要に応じて展開）',
    guideSectionTips: 'ヒント',
    guideResultLabel: '結果：',
    guideSourceData: '元データ',
    guideClassifiedAfterPrefix: '',
    genericHighlights: ['ローカル処理でプライバシーを保護', '軽量で高速なデスクトップ操作', '分かりやすい操作フロー'],
    genericWorkflow: ['対象ツールを開く', '必要な設定を行う', '結果をリアルタイムで確認する', '実行して保存する'],
    genericSettingsTitle: '共通設定',
    genericSettingsItems: ['最初に入力ファイルまたはデータを選択', '出力モードと関連設定を調整', '実行前にプレビューで確認'],
    genericTips: ['少量データで先に確認するのがおすすめです', '元ファイルを保持したい場合はコピー モードを使用してください'],
    genericPreviewTitle: '機能プレビュー',
    genericPreviewTool: 'ツール：{name}',
    genericPreviewSafe: 'ローカル処理 · クラウドへアップロードしない',
    genericBeforeLabel: '処理前',
    genericAfterLabel: '処理後',
    faqMacExplain: 'macOS では、ネットから取得したアプリに隔離属性が付く場合があります。起動がブロックされた場合は以下を実行してください。',
    faqMacCmdHint1: 'まずはこちら（隔離属性のみ削除）：',
    faqMacCmdHint2: 'まだ開けない場合はこちら（拡張属性をすべて削除）：',
    faqMacPathNote: 'パスは実際のアプリ配置先に合わせて変更してください。',
    faqWindowsIntro: 'Windows のインストールでは、次のような案内が出る場合があります。',
    faqWindowsItems: ['SmartScreen が表示されたら「詳細情報」→「実行」を選択。', '権限不足の場合は管理者として実行。', 'セキュリティソフトに阻止された場合は許可リストへ追加。', '推奨環境は Windows 10（1803+）または Windows 11 x64。'],
    privacyFileAccessTitle: 'ファイルアクセス',
    privacyFileAccessItems: ['選択したファイルのみアクセスします', '処理結果は指定した場所にのみ保存されます'],
    privacyUpdateTitle: 'ポリシー更新',
    privacyUpdateDesc: '本ポリシーは更新に伴い変更される場合があります。変更はこのページに掲載します。',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Apple Silicon（M1 以降）のみ対応。WebKit はシステムに含まれます。',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Windows 10（1803+）および Windows 11 の x64 に対応。WebView2 ランタイムは通常プリインストールです。',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri は WebKitGTK に依存します。ディストリビューションごとの差異が大きいため、公式ビルドは現在提供していません。',
  },
  'ko-KR': {
    guideIntroTitle: '먼저 확인하세요',
    guideIntroSteps: ['먼저 "워크플로"를 보고 한 번 실행해 보세요.', '세부 조정이 필요할 때만 "공통 설정"을 펼치세요.', '대량 처리 전 소량 샘플로 먼저 검증하세요.'],
    guideJumpTitle: '빠른 이동',
    guideSectionCore: '핵심 기능',
    guideSectionWorkflow: '워크플로',
    guideSectionSettings: '공통 설정 (필요 시 펼치기)',
    guideSectionTips: '사용 팁',
    guideResultLabel: '결과:',
    guideSourceData: '원본 데이터',
    guideClassifiedAfterPrefix: '',
    genericHighlights: ['로컬 처리로 개인정보 보호', '가볍고 빠른 데스크톱 작업 흐름', '직관적이고 쉬운 인터랙션'],
    genericWorkflow: ['도구 페이지 열기', '필수 옵션 설정', '결과 실시간 확인', '실행 후 저장'],
    genericSettingsTitle: '공통 설정',
    genericSettingsItems: ['먼저 입력 파일 또는 데이터를 선택하세요', '출력 모드와 관련 옵션을 조정하세요', '실행 전에 미리보기로 확인하세요'],
    genericTips: ['먼저 소량 샘플로 결과를 검증하세요', '원본 보존이 필요하면 복사 모드를 사용하세요'],
    genericPreviewTitle: '기능 미리보기',
    genericPreviewTool: '도구: {name}',
    genericPreviewSafe: '로컬 처리 · 클라우드 업로드 없음',
    genericBeforeLabel: '처리 전',
    genericAfterLabel: '처리 후',
    faqMacExplain: 'macOS 에서는 인터넷에서 내려받은 앱에 격리 속성이 붙을 수 있습니다. 실행이 막히면 아래 명령을 사용하세요.',
    faqMacCmdHint1: '먼저 실행할 명령 (격리 속성만 제거):',
    faqMacCmdHint2: '여전히 열리지 않으면 실행 (확장 속성 전체 제거):',
    faqMacPathNote: '경로는 Mac 의 실제 앱 경로로 바꿔 주세요.',
    faqWindowsIntro: 'Windows 설치 시 다음과 같은 상황이 있을 수 있습니다.',
    faqWindowsItems: ['SmartScreen 경고 시 "추가 정보" 후 "실행"을 선택하세요.', '권한 부족 시 관리자 권한으로 실행하세요.', '보안 프로그램이 차단하면 허용 목록에 추가 후 재시도하세요.', '권장 환경은 Windows 10 (1803+) 또는 Windows 11 x64 입니다.'],
    privacyFileAccessTitle: '파일 접근',
    privacyFileAccessItems: ['사용자가 선택한 파일에만 접근합니다', '처리 결과는 지정한 위치에만 저장됩니다'],
    privacyUpdateTitle: '정책 업데이트',
    privacyUpdateDesc: '본 정책은 릴리스와 함께 변경될 수 있으며, 변경 내용은 이 페이지에 게시됩니다.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Apple Silicon (M1 이상)만 지원하며 WebKit 은 시스템에서 제공합니다.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Windows 10 (1803+) 및 Windows 11 x64 를 지원하며 WebView2 런타임은 보통 사전 설치되어 있습니다.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri 는 WebKitGTK 에 의존합니다. 배포판별 WebKit 버전 차이가 커서 현재 공식 빌드는 제공하지 않습니다.',
  },
  'fr-FR': {
    guideIntroTitle: 'Commencez ici',
    guideIntroSteps: ['Lisez d’abord le "Workflow" et faites un essai rapide.', 'Ouvrez les "Paramètres communs" seulement si nécessaire.', 'Testez avec un petit échantillon avant le traitement par lot.'],
    guideJumpTitle: 'Accès rapide',
    guideSectionCore: 'Capacités clés',
    guideSectionWorkflow: 'Workflow',
    guideSectionSettings: 'Paramètres communs (déplier si besoin)',
    guideSectionTips: 'Conseils',
    guideResultLabel: 'Résultat :',
    guideSourceData: 'Données source',
    guideClassifiedAfterPrefix: 'Classé par',
    genericHighlights: ['Traitement local pour protéger la vie privée', 'Workflow desktop léger et rapide', 'Interaction claire et facile à utiliser'],
    genericWorkflow: ['Ouvrir l’outil', 'Configurer les options nécessaires', 'Vérifier le résultat en temps réel', 'Exécuter et enregistrer'],
    genericSettingsTitle: 'Paramètres communs',
    genericSettingsItems: ['Choisissez d’abord les fichiers ou données d’entrée', 'Ajustez le mode de sortie et les options associées', 'Vérifiez l’aperçu avant exécution'],
    genericTips: ['Commencez par un petit échantillon', 'Utilisez le mode copie si vous devez conserver les originaux'],
    genericPreviewTitle: 'Aperçu de la fonctionnalité',
    genericPreviewTool: 'Outil : {name}',
    genericPreviewSafe: 'Traitement local · Aucun envoi cloud',
    genericBeforeLabel: 'Avant',
    genericAfterLabel: 'Après',
    faqMacExplain: 'Sur macOS, les apps téléchargées peuvent recevoir un attribut de quarantaine. Si l’app est bloquée, utilisez les commandes ci-dessous.',
    faqMacCmdHint1: 'Commande recommandée (retirer uniquement la quarantaine) :',
    faqMacCmdHint2: 'Si cela ne fonctionne toujours pas (supprimer tous les attributs étendus) :',
    faqMacPathNote: 'Remplacez le chemin par celui réel de votre application.',
    faqWindowsIntro: 'Sous Windows, vous pouvez rencontrer les cas suivants lors de l’installation :',
    faqWindowsItems: ['Si SmartScreen bloque, cliquez sur "Informations complémentaires" puis "Exécuter quand même".', 'En cas de droits insuffisants, lancez l’installateur en administrateur.', 'Si un antivirus bloque, ajoutez l’installateur à la liste d’autorisation.', 'Système recommandé : Windows 10 (1803+) ou Windows 11 x64.'],
    privacyFileAccessTitle: 'Accès aux fichiers',
    privacyFileAccessItems: ['L’application accède uniquement aux fichiers que vous sélectionnez', 'Les résultats sont enregistrés uniquement à l’emplacement choisi'],
    privacyUpdateTitle: 'Mise à jour de la politique',
    privacyUpdateDesc: 'Cette politique peut évoluer avec les nouvelles versions. Les changements seront publiés ici.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Compatible uniquement Apple Silicon (M1 et plus). WebKit est fourni par le système.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Compatible Windows 10 (1803+) et Windows 11 x64. Le runtime WebView2 est généralement préinstallé.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri dépend de WebKitGTK. Les versions WebKit varient selon les distributions, donc aucune build officielle pour le moment.',
  },
  'de-DE': {
    guideIntroTitle: 'Hier starten',
    guideIntroSteps: ['Zuerst den "Workflow" lesen und einmal testen.', 'Die "Allgemeinen Einstellungen" nur bei Bedarf öffnen.', 'Vor der Stapelverarbeitung mit einer kleinen Stichprobe testen.'],
    guideJumpTitle: 'Schnellsprung',
    guideSectionCore: 'Kernfunktionen',
    guideSectionWorkflow: 'Workflow',
    guideSectionSettings: 'Allgemeine Einstellungen (bei Bedarf aufklappen)',
    guideSectionTips: 'Tipps',
    guideResultLabel: 'Ergebnis:',
    guideSourceData: 'Quelldaten',
    guideClassifiedAfterPrefix: 'Klassifiziert nach',
    genericHighlights: ['Lokale Verarbeitung mit Datenschutz', 'Schneller und leichter Desktop-Workflow', 'Klar und einfach zu bedienen'],
    genericWorkflow: ['Tool-Seite öffnen', 'Benötigte Optionen konfigurieren', 'Ergebnisse in Echtzeit prüfen', 'Ausführen und speichern'],
    genericSettingsTitle: 'Allgemeine Einstellungen',
    genericSettingsItems: ['Zuerst Eingabedateien oder Daten auswählen', 'Ausgabemodus und zugehörige Optionen anpassen', 'Vor Ausführung Vorschau prüfen'],
    genericTips: ['Zuerst mit einer kleinen Stichprobe testen', 'Für Originalerhalt den Kopiermodus verwenden'],
    genericPreviewTitle: 'Funktionsvorschau',
    genericPreviewTool: 'Tool: {name}',
    genericPreviewSafe: 'Lokale Verarbeitung · Kein Cloud-Upload',
    genericBeforeLabel: 'Vorher',
    genericAfterLabel: 'Nachher',
    faqMacExplain: 'Unter macOS können heruntergeladene Apps mit Quarantäneattributen markiert werden. Wenn die App blockiert wird, nutzen Sie die folgenden Befehle.',
    faqMacCmdHint1: 'Empfohlener Befehl (nur Quarantäne entfernen):',
    faqMacCmdHint2: 'Falls es weiterhin nicht funktioniert (alle erweiterten Attribute löschen):',
    faqMacPathNote: 'Ersetzen Sie den Pfad durch den tatsächlichen App-Pfad auf Ihrem Mac.',
    faqWindowsIntro: 'Unter Windows können bei der Installation folgende Situationen auftreten:',
    faqWindowsItems: ['Bei SmartScreen auf "Weitere Informationen" und dann "Trotzdem ausführen" klicken.', 'Bei fehlenden Rechten den Installer als Administrator starten.', 'Bei Blockierung durch Sicherheitssoftware zur Ausnahmeliste hinzufügen.', 'Empfohlenes System: Windows 10 (1803+) oder Windows 11 x64.'],
    privacyFileAccessTitle: 'Dateizugriff',
    privacyFileAccessItems: ['Die App greift nur auf von Ihnen ausgewählte Dateien zu', 'Ergebnisse werden nur am von Ihnen gewählten Ort gespeichert'],
    privacyUpdateTitle: 'Aktualisierung der Richtlinie',
    privacyUpdateDesc: 'Diese Richtlinie kann sich mit neuen Versionen ändern. Änderungen werden hier veröffentlicht.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Unterstützt nur Apple Silicon (M1 und neuer). WebKit wird vom System bereitgestellt.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Unterstützt Windows 10 (1803+) und Windows 11 x64. Die WebView2 Laufzeit ist in der Regel vorinstalliert.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri ist von WebKitGTK abhängig. Da sich WebKit Versionen je Distribution stark unterscheiden, gibt es derzeit keine offiziellen Builds.',
  },
  'es-ES': {
    guideIntroTitle: 'Empieza aquí',
    guideIntroSteps: ['Lee primero el "Flujo de trabajo" y haz una prueba rápida.', 'Abre "Ajustes comunes" solo cuando lo necesites.', 'Prueba con una muestra pequeña antes del procesamiento por lotes.'],
    guideJumpTitle: 'Salto rápido',
    guideSectionCore: 'Capacidades clave',
    guideSectionWorkflow: 'Flujo de trabajo',
    guideSectionSettings: 'Ajustes comunes (desplegar según necesidad)',
    guideSectionTips: 'Consejos',
    guideResultLabel: 'Resultado:',
    guideSourceData: 'Datos de origen',
    guideClassifiedAfterPrefix: 'Clasificado por',
    genericHighlights: ['Procesamiento local con protección de privacidad', 'Flujo de escritorio rápido y ligero', 'Interacción clara y fácil de usar'],
    genericWorkflow: ['Abrir la herramienta', 'Configurar opciones necesarias', 'Revisar resultados en tiempo real', 'Ejecutar y guardar'],
    genericSettingsTitle: 'Ajustes comunes',
    genericSettingsItems: ['Primero selecciona archivos o datos de entrada', 'Ajusta modo de salida y opciones relacionadas', 'Revisa la vista previa antes de ejecutar'],
    genericTips: ['Prueba primero con una muestra pequeña', 'Usa modo copia si necesitas conservar los originales'],
    genericPreviewTitle: 'Vista previa de función',
    genericPreviewTool: 'Herramienta: {name}',
    genericPreviewSafe: 'Procesamiento local · Sin subida a la nube',
    genericBeforeLabel: 'Antes',
    genericAfterLabel: 'Después',
    faqMacExplain: 'En macOS, las apps descargadas pueden recibir atributos de cuarentena. Si la app se bloquea, usa los siguientes comandos.',
    faqMacCmdHint1: 'Comando recomendado (solo quitar cuarentena):',
    faqMacCmdHint2: 'Si aún no abre (limpiar todos los atributos extendidos):',
    faqMacPathNote: 'Reemplaza la ruta por la ruta real de la app en tu Mac.',
    faqWindowsIntro: 'En Windows, durante la instalación puedes encontrar estos casos:',
    faqWindowsItems: ['Si SmartScreen bloquea, pulsa "Más información" y luego "Ejecutar de todas formas".', 'Si faltan permisos, ejecuta el instalador como administrador.', 'Si un antivirus bloquea, añádelo a la lista de permitidos y reintenta.', 'Sistema recomendado: Windows 10 (1803+) o Windows 11 x64.'],
    privacyFileAccessTitle: 'Acceso a archivos',
    privacyFileAccessItems: ['La app accede solo a los archivos que seleccionas', 'Los resultados se guardan solo en la ubicación que elijas'],
    privacyUpdateTitle: 'Actualización de la política',
    privacyUpdateDesc: 'Esta política puede ajustarse con nuevas versiones. Los cambios se publicarán en esta página.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Solo compatible con Apple Silicon (M1 y superior). WebKit lo proporciona el sistema.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Compatible con Windows 10 (1803+) y Windows 11 x64. El runtime de WebView2 suele venir preinstalado.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri depende de WebKitGTK. Como la versión de WebKit varía entre distribuciones, no ofrecemos builds oficiales por ahora.',
  },
  'it-IT': {
    guideIntroTitle: 'Inizia da qui',
    guideIntroSteps: ['Leggi prima il "Workflow" ed esegui un test rapido.', 'Apri le "Impostazioni comuni" solo quando serve.', 'Testa con un piccolo campione prima dell’elaborazione batch.'],
    guideJumpTitle: 'Accesso rapido',
    guideSectionCore: 'Funzionalità chiave',
    guideSectionWorkflow: 'Workflow',
    guideSectionSettings: 'Impostazioni comuni (espandi se necessario)',
    guideSectionTips: 'Suggerimenti',
    guideResultLabel: 'Risultato:',
    guideSourceData: 'Dati sorgente',
    guideClassifiedAfterPrefix: 'Classificato per',
    genericHighlights: ['Elaborazione locale con tutela della privacy', 'Flusso desktop rapido e leggero', 'Interazione chiara e semplice'],
    genericWorkflow: ['Apri lo strumento', 'Configura le opzioni necessarie', 'Controlla i risultati in tempo reale', 'Esegui e salva'],
    genericSettingsTitle: 'Impostazioni comuni',
    genericSettingsItems: ['Seleziona prima file o dati di input', 'Regola modalità di output e opzioni correlate', 'Controlla l’anteprima prima di eseguire'],
    genericTips: ['Prova prima con un piccolo campione', 'Usa la modalità copia se vuoi mantenere gli originali'],
    genericPreviewTitle: 'Anteprima funzione',
    genericPreviewTool: 'Strumento: {name}',
    genericPreviewSafe: 'Elaborazione locale · Nessun upload cloud',
    genericBeforeLabel: 'Prima',
    genericAfterLabel: 'Dopo',
    faqMacExplain: 'Su macOS, le app scaricate possono avere attributi di quarantena. Se l’app viene bloccata, usa i comandi seguenti.',
    faqMacCmdHint1: 'Comando consigliato (rimuove solo la quarantena):',
    faqMacCmdHint2: 'Se non si apre ancora (rimuove tutti gli attributi estesi):',
    faqMacPathNote: 'Sostituisci il percorso con il percorso reale della tua app su Mac.',
    faqWindowsIntro: 'Su Windows, durante l’installazione possono comparire questi casi:',
    faqWindowsItems: ['Se SmartScreen blocca, clicca "Altre informazioni" e poi "Esegui comunque".', 'Se mancano i permessi, avvia l’installer come amministratore.', 'Se l’antivirus blocca, aggiungi alla lista consentita e riprova.', 'Sistema consigliato: Windows 10 (1803+) o Windows 11 x64.'],
    privacyFileAccessTitle: 'Accesso ai file',
    privacyFileAccessItems: ['L’app accede solo ai file che selezioni', 'I risultati vengono salvati solo nella posizione scelta'],
    privacyUpdateTitle: 'Aggiornamenti della policy',
    privacyUpdateDesc: 'Questa policy può essere aggiornata con le nuove versioni. Le modifiche saranno pubblicate in questa pagina.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Supporta solo Apple Silicon (M1 e successivi). WebKit è fornito dal sistema.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Supporta Windows 10 (1803+) e Windows 11 x64. Il runtime WebView2 è in genere preinstallato.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri dipende da WebKitGTK. Poiché la versione WebKit varia tra le distribuzioni, al momento non forniamo build ufficiali.',
  },
  'ru-RU': {
    guideIntroTitle: 'Начните здесь',
    guideIntroSteps: ['Сначала прочитайте "Процесс" и сделайте быстрый тест.', 'Раздел "Общие настройки" открывайте только при необходимости.', 'Перед пакетной обработкой проверьте на небольшом примере.'],
    guideJumpTitle: 'Быстрый переход',
    guideSectionCore: 'Ключевые возможности',
    guideSectionWorkflow: 'Процесс',
    guideSectionSettings: 'Общие настройки (раскрывайте при необходимости)',
    guideSectionTips: 'Советы',
    guideResultLabel: 'Результат:',
    guideSourceData: 'Исходные данные',
    guideClassifiedAfterPrefix: 'Классификация по',
    genericHighlights: ['Локальная обработка с защитой приватности', 'Быстрый и легкий desktop-процесс', 'Понятный и удобный интерфейс'],
    genericWorkflow: ['Откройте нужный инструмент', 'Настройте необходимые параметры', 'Проверьте результат в реальном времени', 'Запустите и сохраните результат'],
    genericSettingsTitle: 'Общие настройки',
    genericSettingsItems: ['Сначала выберите входные файлы или данные', 'Настройте режим вывода и связанные параметры', 'Перед запуском проверьте предпросмотр'],
    genericTips: ['Сначала протестируйте на небольшом примере', 'Если нужно сохранить оригиналы, используйте режим копирования'],
    genericPreviewTitle: 'Предпросмотр функции',
    genericPreviewTool: 'Инструмент: {name}',
    genericPreviewSafe: 'Локальная обработка · Без загрузки в облако',
    genericBeforeLabel: 'До',
    genericAfterLabel: 'После',
    faqMacExplain: 'В macOS загруженные из сети приложения могут получить атрибут карантина. Если запуск блокируется, используйте команды ниже.',
    faqMacCmdHint1: 'Рекомендуемая команда (удаляет только карантин):',
    faqMacCmdHint2: 'Если всё ещё не открывается (очистить все расширенные атрибуты):',
    faqMacPathNote: 'Замените путь на фактический путь приложения на вашем Mac.',
    faqWindowsIntro: 'В Windows при установке могут встречаться такие случаи:',
    faqWindowsItems: ['Если SmartScreen блокирует, нажмите "Подробнее", затем "Все равно выполнить".', 'При нехватке прав запустите установщик от имени администратора.', 'Если антивирус блокирует, добавьте установщик в исключения и повторите попытку.', 'Рекомендуемая система: Windows 10 (1803+) или Windows 11 x64.'],
    privacyFileAccessTitle: 'Доступ к файлам',
    privacyFileAccessItems: ['Приложение получает доступ только к выбранным вами файлам', 'Результаты сохраняются только в указанное вами место'],
    privacyUpdateTitle: 'Обновление политики',
    privacyUpdateDesc: 'Эта политика может обновляться с новыми версиями. Изменения будут опубликованы на этой странице.',
    platformNoteMacLabel: 'macOS',
    platformNoteMacDesc: 'Поддерживается только Apple Silicon (M1 и новее). WebKit предоставляется системой.',
    platformNoteWindowsLabel: 'Windows',
    platformNoteWindowsDesc: 'Поддерживаются Windows 10 (1803+) и Windows 11 x64. Среда WebView2 обычно предустановлена.',
    platformNoteLinuxLabel: 'Linux',
    platformNoteLinuxDesc: 'Tauri зависит от WebKitGTK. Из-за различий версий WebKit между дистрибутивами официальные сборки пока не предоставляются.',
  },
};

Object.keys(siteI18nEnhancements).forEach((locale) => {
  siteI18n[locale] = { ...(siteI18n[locale] || siteI18n.en), ...siteI18nEnhancements[locale] };
});

function normalizeLocale(locale) {
  const lc = (locale || '').toLowerCase();
  if (lc.startsWith('zh-hant') || lc.startsWith('zh-tw') || lc.startsWith('zh-hk') || lc.startsWith('zh-mo')) return 'zh-TW';
  if (lc.startsWith('zh')) return 'zh-CN';
  if (lc.startsWith('ja')) return 'ja-JP';
  if (lc.startsWith('ko')) return 'ko-KR';
  if (lc.startsWith('fr')) return 'fr-FR';
  if (lc.startsWith('de')) return 'de-DE';
  if (lc.startsWith('es')) return 'es-ES';
  if (lc.startsWith('it')) return 'it-IT';
  if (lc.startsWith('ru')) return 'ru-RU';
  if (lc.startsWith('en')) return 'en';
  return 'zh-CN';
}

function resolveInitialLocale() {
  const saved = localStorage.getItem(siteLocaleStorageKey);
  if (saved && supportedLocales.includes(saved)) return saved;
  const browser = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  return normalizeLocale(browser);
}

let currentLocale = resolveInitialLocale();

function getLocaleBundle(locale = currentLocale) {
  return localeBundles[locale] || localeBundles['zh-CN'];
}

function t(key) {
  const localePack = siteI18n[currentLocale] || siteI18n.en;
  return localePack[key] || siteI18n.en[key] || siteI18n['zh-CN'][key] || key;
}

function formatText(template, variables = {}) {
  if (typeof template !== 'string') return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? '');
}

const guideFeatureDetailsEn = {
  rename: {
    highlights: [
      'Visual rule configuration, combine rules like building blocks.',
      'Freely combine 10 naming rules with drag-and-drop sorting.',
      'Real-time rename preview, what you see is what you get.',
      'Copy mode protects original files and keeps operations reversible.',
      'Support manual editing for individual file names',
    ],
    snippet: {
      title: 'Rename preview',
      lines: [
        { text: 'IMG_001.jpg -> 2024-01-30_trip_1920x1080_01.jpg', color: 'var(--color-syn-blue)' },
        { text: 'IMG_002.jpg -> 2024-01-30_trip_3840x2160_02.jpg', color: 'var(--color-syn-blue)' },
        { text: 'IMG_003.jpg -> 2024-01-30_trip_4032x3024_03.jpg', color: 'var(--color-syn-blue)' },
        { text: '' },
        { text: 'Completed: 3 files renamed', color: 'var(--color-syn-green)' },
      ],
    },
    example: {
      type: 'rules',
      title: 'Example: Rename trip photos by date + theme + pixel size + sequence',
      rules: [
        { label: 'Modified time', color: 'var(--color-syn-orange)', value: '2024-01-30' },
        { label: 'Separator', color: 'var(--color-muted)', value: '_' },
        { label: 'Text', color: 'var(--color-syn-green)', value: 'trip' },
        { label: 'Separator', color: 'var(--color-muted)', value: '_' },
        { label: 'Pixel size', color: 'var(--color-syn-red)', value: '1920x1080' },
        { label: 'Separator', color: 'var(--color-muted)', value: '_' },
        { label: 'Sequence', color: 'var(--color-syn-blue)', value: '01' },
      ],
      result: '2024-01-30_trip_1920x1080_01.jpg',
    },
    details: [
      { title: 'Naming rule types', items: ['Sequence: define start value and digits (for example 001, 002, 003)', 'Text: insert any custom text content', 'Current time: multiple precision levels and separator formats', 'Created time: use file creation timestamp', 'Modified time: use file modification timestamp', 'File size: auto/B/KB/MB/GB/TB, optional unit display', 'Pixel size: width and height, width only, height only, aspect ratio, with configurable separators x/X/*/-/_/.', 'Original name: keep all, find and replace, or crop by position', 'Separator: 15 common separators (such as -, _, ., (, ), [, ])', 'Random string: configurable length from 1 to 32, supports digits and letters'] },
      { title: 'File management', items: ['Support multi-file batch selection', 'Sort by name, size, created time, modified time in ascending or descending order', '1 to 6 column grid display with flexible layout', 'Show 4 rows by default with expand option', 'Click preview name to edit a single file name manually (extension preserved automatically)'] },
      { title: 'Output modes', items: ['Direct rename: rename files in place', 'In-place copy: create renamed copies in the same folder', 'Archive copy: copy files to a target folder, with optional subfolder'] },
    ],
    workflow: ['Select files to rename', 'Add naming rules and drag to reorder', 'Click rule chips to edit parameters', 'Preview new names in real time, and manually edit special files if needed', 'Choose output mode (direct rename or copy)', 'Run rename and check results'],
    tips: ['Enable copy mode first, then switch to direct rename after confirmation.', 'Preview names support manual editing for small sets of special files.'],
  },
  classify: {
    highlights: ['Select a category column and archive in one click', 'Supports batch processing for multiple Excel files', 'Preserves merged cells and column widths', 'Unified settings or per-file settings', 'Detailed classification statistics report'],
    snippet: {
      title: 'Classification result',
      lines: [
        { text: 'File: sales-data.xlsx', color: 'var(--color-fg)' },
        { text: 'Category column: Department', color: 'var(--color-fg)' },
        { text: '' },
        { text: '|- Marketing -> 128 rows', color: 'var(--color-syn-green)' },
        { text: '|- Engineering -> 96 rows', color: 'var(--color-syn-blue)' },
        { text: '|- Sales -> 215 rows', color: 'var(--color-syn-orange)' },
        { text: 'Total -> 439 rows', color: 'var(--color-syn-purple)' },
      ],
    },
    example: {
      type: 'table',
      title: 'Example: Classify employee data by the "Department" column',
      headers: ['Name', 'Department', 'Role', 'Join Date'],
      rows: [['Alice', 'Marketing', 'Manager', '2022-03-15'], ['Bob', 'Engineering', 'Engineer', '2023-01-10'], ['Carol', 'Marketing', 'Specialist', '2023-06-20'], ['David', 'Engineering', 'Designer', '2022-11-05'], ['Eric', 'Sales', 'Supervisor', '2021-08-12']],
    },
    details: [
      { title: 'File processing', items: ['Supports .xlsx and .xls formats', 'Supports selecting multiple Excel files for batch processing', 'Automatically reads and shows column information'] },
      { title: 'Setting modes', items: ['Unified settings: all files use the same category column and header row count, only shared columns are shown', 'Individual settings: configure category column and header rows per file', 'Header rows: choose 1 to 10 rows, and keep them as headers after classification'] },
      { title: 'Classification modes', items: ['New Sheet: each category is generated as a new sheet in the source file, original data remains in the "All" sheet', 'Separate files: each category is exported as an independent Excel file, file name uses the category value'] },
      { title: 'Output settings', items: ['Custom output directory with optional subfolder', 'Optional file name prefix and suffix', 'Keep merged cells and column widths automatically', 'Skip rows with empty category values and verify row counts'] },
    ],
    workflow: ['Add one or more Excel files', 'Choose unified settings or individual settings', 'Select category column and header row count', 'Choose classification mode (new sheet or separate files)', 'Set output directory and file name rules', 'Run processing and review statistics and details'],
    tips: ['Confirm header row count before selecting the category column for better accuracy.', 'Rows with empty category values are skipped, and you can check the count in statistics.'],
  },
  image: {
    highlights: ['Local processing, no image upload to any server', 'Supports conversion between JPEG, PNG, and WebP', 'Adjustable compression quality from 1 percent to 100 percent', 'Per-image individual parameter settings', 'Real-time compression ratio and size comparison'],
    snippet: {
      title: 'Compression result',
      lines: [
        { text: 'photo_01.jpg 2.4 MB -> 320 KB down 86.7%', color: 'var(--color-syn-green)' },
        { text: 'photo_02.png 5.1 MB -> 890 KB down 82.9%', color: 'var(--color-syn-green)' },
        { text: 'banner.webp 1.8 MB -> 245 KB down 86.7%', color: 'var(--color-syn-green)' },
        { text: '------------------------------' },
        { text: 'Total: 9.3 MB -> 1.4 MB, saved 84.9%', color: 'var(--color-syn-yellow)' },
      ],
    },
    example: {
      type: 'before-after',
      title: 'Example: Batch compress product images',
      before: { label: 'Before compression', items: ['photo_01.jpg - 2.4 MB', 'photo_02.png - 5.1 MB', 'banner.webp - 1.8 MB', 'Total 9.3 MB'] },
      after: { label: 'After compression (quality 75 percent)', items: ['photo_01.jpg - 320 KB down 86.7%', 'photo_02.png - 890 KB down 82.9%', 'banner.webp - 245 KB down 86.7%', 'Total 1.4 MB, saved 84.9%'] },
    },
    details: [
      { title: 'Processing modes', items: ['Compress image: reduce file size while keeping or converting format', 'Convert format: mainly for format conversion with high quality'] },
      { title: 'Processing parameters', items: ['Compression quality: 1 percent to 100 percent, recommended 60 percent to 80 percent', 'Max width: scale down proportionally when width exceeds this value, smaller images are not enlarged', 'Output format: keep original, JPEG, PNG, or WebP'] },
      { title: 'Setting modes', items: ['Unified settings: all images use the same parameters', 'Individual settings: each image can set quality, width, and format separately'] },
      { title: 'Output methods', items: ['Browser download: download processed files directly in browser', 'In-place copy: save processed files in the same folder', 'Archive copy: save processed files to a selected folder'] },
    ],
    workflow: ['Choose compress mode or convert mode', 'Add image files', 'Adjust quality, max width, and output format', 'Select output method', 'Run processing and review compression ratio and file size', 'Save all files or download one by one'],
    tips: ['For compression mode, quality from 60 percent to 80 percent is recommended.', 'Convert mode keeps the original image and is suitable for batch format normalization.'],
  },
  pdf: {
    highlights: ['Local processing to keep PDF content private', 'Merge multiple files with drag-and-drop order adjustment', 'Flexible split by page or page range', 'Custom page ranges such as 1-3, 5, 7-10', 'Auto download after processing'],
    snippet: {
      title: 'Operation sample',
      lines: [
        { text: 'Merge PDF', color: 'var(--color-syn-blue)' },
        { text: 'report.pdf + appendix.pdf + cover.pdf', color: 'var(--color-fg)' },
        { text: '-> merged.pdf (42 pages)', color: 'var(--color-syn-green)' },
        { text: '' },
        { text: 'Split PDF', color: 'var(--color-syn-orange)' },
        { text: 'document.pdf, page range: 1-3, 5, 7-10', color: 'var(--color-fg)' },
        { text: '-> 3 separate files', color: 'var(--color-syn-green)' },
      ],
    },
    example: {
      type: 'before-after',
      title: 'Example: Merge multiple PDF files',
      before: { label: 'Before merge (3 files)', items: ['cover.pdf - 1 page', 'report.pdf - 35 pages', 'appendix.pdf - 6 pages'] },
      after: { label: 'After merge (1 file)', items: ['merged.pdf - total 42 pages', 'Ordered as cover -> report -> appendix', 'Downloaded automatically to local'] },
    },
    details: [
      { title: 'Merge PDF', items: ['Select multiple PDF files', 'Show page count of each file', 'Adjust merge order with move up and move down', 'Remove unnecessary files', 'Output merged.pdf in selected order'] },
      { title: 'Split PDF', items: ['One file per page: split every page into independent PDFs', 'Split by range: custom range such as 1-3, 5, 7-10', 'Supports mixed single pages and ranges', 'Automatically validates page range', 'Auto download after processing'] },
    ],
    workflow: ['Choose merge mode or split mode', 'For merge: add multiple PDFs and adjust order', 'For split: select one PDF and set split mode', 'Click run and download output automatically'],
    tips: ['Adjust order before merging because export order will match exactly.', 'Page range supports mixed single pages and ranges such as 1-3, 5, 7-10.'],
  },
  qrcode: {
    highlights: ['24 preset color schemes plus custom colors', '5 styles for dots and finder patterns', 'Supports adding brand logo', 'Built-in scan test to ensure availability', 'Scan QR code from image or clipboard'],
    snippet: {
      title: 'Generation settings',
      lines: [
        { text: 'Content: https://example.com', color: 'var(--color-fg)' },
        { text: 'Size: 300 x 300 px', color: 'var(--color-fg)' },
        { text: 'Error correction: H (30%)', color: 'var(--color-syn-yellow)' },
        { text: 'Dot style: rounded', color: 'var(--color-syn-purple)' },
        { text: 'Logo: company-logo.png', color: 'var(--color-syn-green)' },
        { text: '' },
        { text: 'Scan test passed', color: 'var(--color-syn-green)' },
      ],
    },
    example: {
      type: 'before-after',
      title: 'Example: Generate branded QR code',
      before: { label: 'Basic settings', items: ['Content: https://example.com', 'Color scheme: blue', 'Style: rounded dots'] },
      after: { label: 'Advanced customization', items: ['Add brand logo', 'Error correction H (30%)', 'Custom finder pattern style', 'Scan test passed'] },
    },
    details: [
      { title: 'Generation settings', items: ['Input content: supports plain text, URL, and more', 'Size: adjustable QR size in pixels', 'Error correction levels: L (7%), M (15%), Q (25%), H (30%)', 'Margin: adjust the blank area around QR code'] },
      { title: 'Color schemes', items: ['24 preset color schemes such as classic black and white, blue, green, purple, red', 'Random color: generate random color combinations in one click', 'Custom colors: foreground, background, and finder colors', 'Supports hex and RGB input'] },
      { title: 'Style settings', items: ['Dot shapes: square, rounded, extra rounded, classic', 'Finder shapes: square, rounded, medium rounded, thin rounded, bold round', 'Random style: one-click random style combination'] },
      { title: 'Logo settings', items: ['Select logo image file', 'Size: percentage of QR code area', 'Corner radius: logo corner radius percentage', 'Padding: white padding around logo', 'Recommended: H level + smaller logo + simple shape'] },
      { title: 'Scan QR code', items: ['Upload image: select QR image for scanning', 'Paste image: Ctrl+V or Command+V from clipboard', 'Show decoded result with one-click copy'] },
    ],
    workflow: ['Input QR content', 'Choose preset color scheme or custom colors', 'Adjust size, error correction, and styles', 'Add logo if needed', 'Run scan test to verify readability', 'Download image or copy to clipboard'],
    tips: ['After adding a logo, run a scan test once.', 'Scan mode supports both image upload and keyboard paste.'],
  },
  textdiff: {
    highlights: ['Three diff granularities: character, word, line', 'Real-time comparison as you type', 'Clear red and green highlights for differences', 'Statistics for added, removed, and unchanged characters', 'One-click swap and copy result'],
    snippet: {
      title: 'Comparison result',
      lines: [
        { text: 'Compare mode: by character', color: 'var(--color-fg)' },
        { text: '' },
        { text: 'Original: Youran Toolbox v0.0.6', color: 'var(--color-syn-red)' },
        { text: 'Changed: Youran Toolbox v0.0.7', color: 'var(--color-syn-green)' },
        { text: '------------------', color: 'var(--color-fg)' },
        { text: 'Added 1 char, removed 1 char, unchanged 19 chars', color: 'var(--color-syn-cyan)' },
      ],
    },
    example: {
      type: 'before-after',
      title: 'Example: Proofread copy updates',
      before: { label: 'Original text', items: ['Youran Toolbox is a lightweight utility', 'Supports macOS and Windows', 'Version v0.0.6'] },
      after: { label: 'Updated text', items: ['Youran Toolbox is a lightweight desktop toolkit', 'Supports macOS and Windows dual platform', 'Version v0.0.7'] },
    },
    details: [
      { title: 'Compare modes', items: ['By character: precise character-level differences for small edits', 'By word: compare by words separated by spaces', 'By line: compare by line breaks, suitable for code and config files'] },
      { title: 'Result display', items: ['Added content: highlighted with green background', 'Removed content: highlighted with red background and strike-through', 'Unchanged content: displayed normally', 'Statistics: added, removed, and unchanged character counts'] },
      { title: 'Actions', items: ['Swap: one-click swap left and right texts', 'Clear: clear all input content', 'Copy: one-click copy of comparison result text', 'Real-time compare: result updates as input changes'] },
    ],
    workflow: ['Input original text on the left', 'Input updated text on the right', 'Choose compare mode (character, word, or line)', 'Review highlighted differences', 'Copy result or swap texts for another comparison'],
    tips: ['Character mode is better for short copy, and line mode is better for long text.', 'You can copy the result in one click for documents or messages.'],
  },
  heatmap: {
    highlights: ['Paste data directly from Excel with zero threshold', '10 preset palettes plus custom colors', 'One-click XY axis swap (matrix transpose)', 'Flexible adjustment for cell size, spacing, and label angle', 'Export high-resolution PNG in 1x, 2x, 3x'],
    snippet: {
      title: 'Heatmap settings',
      lines: [
        { text: 'Data: 12 x 8 matrix', color: 'var(--color-fg)' },
        { text: 'Palette: purple', color: 'var(--color-syn-purple)' },
        { text: 'Cell: 48 x 32 px', color: 'var(--color-fg)' },
        { text: 'Label angle: -45 deg', color: 'var(--color-fg)' },
        { text: '' },
        { text: 'Exported heatmap.png (2x)', color: 'var(--color-syn-green)' },
      ],
    },
    example: {
      type: 'before-after',
      title: 'Example: Generate sales heatmap from Excel',
      before: { label: 'Raw Excel data', items: ['Tab-separated table data', 'First row as column labels', 'First column as row labels', 'Remaining cells as numeric values'] },
      after: { label: 'Generated heatmap', items: ['Row and column labels detected automatically', 'Larger values use deeper color', 'Zero values are transparent', 'Export high-resolution PNG in one click'] },
    },
    details: [
      { title: 'Data input', items: ['Copy table data from Excel and paste with Ctrl+V or Command+V', 'Keep first cell in first row empty, then column labels', 'First column as row labels, remaining cells as numeric values', 'Edit labels and values directly after paste', 'Cells with value 0 are shown as transparent'] },
      { title: 'Color settings', items: ['10 preset palettes: purple, blue, green, red, orange, teal, pink, indigo, amber, cyan', 'Supports custom color picker', 'Larger values use deeper color with linear opacity mapping from 15 percent to 100 percent', 'Text color switches between black and white based on background brightness'] },
      { title: 'Layout settings', items: ['Cell width: adjustable from 28 to 80 px', 'Cell height: adjustable from 20 to 60 px', 'Cell spacing: 5 levels from 0 to 4 px', 'X-axis label angle: 11 levels from -90 to -15 degrees', 'Chart title, X and Y axis titles, and legend title are customizable', 'One-click XY axis swap (matrix transpose)'] },
      { title: 'Legend', items: ['Vertical gradient bar to show value range', 'Automatically computes neat ticks', 'Always includes 0 with approximately 5 tick segments'] },
      { title: 'Export image', items: ['Image padding: adjustable from 0 to 60 px', 'Export scale: 1x, 2x, or 3x', 'PNG with white background', 'Save path chosen with system dialog'] },
    ],
    workflow: ['Copy data from Excel and paste to the page', 'Choose preset palette or custom colors', 'Adjust cell size, spacing, and label angle', 'Add chart title and axis titles if needed', 'Click export, choose scale and save path'],
    tips: ['When pasting from Excel, keep the first cell in first row empty and use first column as row labels.', 'Adjust padding and export scale before exporting for reports or print.'],
  },
};

function getLocalizedFeatureDetail(feature) {
  const fillList = (sourceList, targetLength) => {
    if (!Array.isArray(sourceList) || sourceList.length === 0) return [];
    return Array.from({ length: targetLength }, (_, index) => sourceList[index % sourceList.length]);
  };

  const buildLocaleFallbackDetail = (baseFeature, localizedBasics) => {
    const genericHighlights = t('genericHighlights') || [];
    const genericWorkflow = t('genericWorkflow') || [];
    const genericSettingsItems = t('genericSettingsItems') || [];
    const genericTips = t('genericTips') || [];
    const genericSnippetPool = [
      formatText(t('genericPreviewTool'), { name: localizedBasics.name }),
      t('genericPreviewSafe'),
      ...genericWorkflow,
      ...genericTips,
    ].filter(Boolean);
    let snippetTextIndex = 0;
    const snippetLines = baseFeature.snippet.lines.map((line) => {
      if (!line.text) return { ...line };
      if (genericSnippetPool.length === 0) return { ...line };
      const text = genericSnippetPool[snippetTextIndex % genericSnippetPool.length];
      snippetTextIndex += 1;
      return { ...line, text };
    });

    const detailsTitlePool = [
      t('genericSettingsTitle'),
      t('guideSectionWorkflow'),
      t('guideSectionTips'),
      t('guideSectionCore'),
      t('guideSectionSettings'),
    ].filter(Boolean);
    const detailsItemPool = [
      genericSettingsItems,
      genericWorkflow,
      genericTips,
      genericHighlights,
      genericSettingsItems,
    ];

    const localizedDetails = baseFeature.details.map((detail, index) => {
      const localizedItems = fillList(detailsItemPool[index] || genericSettingsItems, detail.items.length);
      return {
        ...detail,
        title: detailsTitlePool[index] || detail.title,
        items: localizedItems.length > 0 ? localizedItems : detail.items,
      };
    });

    let localizedExample = baseFeature.example;
    if (baseFeature.example.type === 'before-after') {
      localizedExample = {
        ...baseFeature.example,
        title: formatText(t('genericPreviewTool'), { name: localizedBasics.name }),
        before: {
          ...baseFeature.example.before,
          label: t('genericBeforeLabel') || baseFeature.example.before.label,
          items: fillList(genericSettingsItems, baseFeature.example.before.items.length),
        },
        after: {
          ...baseFeature.example.after,
          label: t('genericAfterLabel') || baseFeature.example.after.label,
          items: fillList(genericWorkflow, baseFeature.example.after.items.length),
        },
      };
    }

    if (baseFeature.example.type === 'rules') {
      const ruleLabelPool = [t('guideSectionCore'), t('guideSectionSettings'), t('guideSectionWorkflow'), t('guideSectionTips')].filter(Boolean);
      localizedExample = {
        ...baseFeature.example,
        title: formatText(t('genericPreviewTool'), { name: localizedBasics.name }),
        rules: baseFeature.example.rules.map((rule, index) => ({
          ...rule,
          label: ruleLabelPool[index % ruleLabelPool.length] || rule.label,
        })),
        result: t('genericPreviewSafe') || baseFeature.example.result,
      };
    }

    if (baseFeature.example.type === 'table') {
      const tableHeaderPool = [
        t('genericBeforeLabel'),
        t('guideSectionCore'),
        t('guideSectionWorkflow'),
        t('guideSectionTips'),
      ].filter(Boolean);
      const tableCellPool = [...genericWorkflow, ...genericSettingsItems, ...genericTips].filter(Boolean);
      localizedExample = {
        ...baseFeature.example,
        title: formatText(t('genericPreviewTool'), { name: localizedBasics.name }),
        headers: baseFeature.example.headers.map((header, index) => tableHeaderPool[index] || header),
        rows: baseFeature.example.rows.map((row, rowIndex) => row.map((cell, cellIndex) => {
          if (cellIndex === 0) return `${localizedBasics.name} ${rowIndex + 1}`;
          return tableCellPool[(rowIndex + cellIndex) % tableCellPool.length] || cell;
        })),
      };
    }

    return {
      ...baseFeature,
      highlights: fillList(genericHighlights, baseFeature.highlights.length),
      snippet: {
        ...baseFeature.snippet,
        title: t('genericPreviewTitle') || baseFeature.snippet.title,
        lines: snippetLines,
      },
      example: localizedExample,
      details: localizedDetails,
      workflow: fillList(genericWorkflow, baseFeature.workflow.length),
      tips: fillList(genericTips, (guideTips[baseFeature.id] || []).length),
    };
  };

  if (currentLocale === 'zh-CN') {
    return {
      ...feature,
      tips: guideTips[feature.id] || [],
    };
  }

  if (currentLocale !== 'en') {
    const localizedBasics = getLocalizedFeatureBasics(feature);
    return buildLocaleFallbackDetail(feature, localizedBasics);
  }

  const localized = guideFeatureDetailsEn[feature.id];
  if (!localized) return { ...feature, tips: guideTips[feature.id] || [] };

  return {
    ...feature,
    highlights: localized.highlights || feature.highlights,
    snippet: localized.snippet || feature.snippet,
    example: localized.example || feature.example,
    details: localized.details || feature.details,
    workflow: localized.workflow || feature.workflow,
    tips: localized.tips || [],
  };
}

function getLocalizedFeatureBasics(feature) {
  const localePack = getLocaleBundle();
  const localeFeatureKey = featureLocaleKeyMap[feature.id];
  const localeFeature = localePack.features?.[localeFeatureKey];
  return {
    name: localeFeature?.title || feature.name,
    desc: localeFeature?.desc || feature.description,
  };
}

function isFullGuideLocale() {
  return currentLocale === 'zh-CN';
}

function renderMainlandDownloadCard() {
  const mainlandAssets = [
    {
      name: `Youran Toolbox_${appVersion}_aarch64.dmg`,
      platform: 'macOS',
      desc: 'Apple Silicon',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" style="color: var(--color-fg)"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
    },
    {
      name: `Youran Toolbox_${appVersion}_x64-setup.exe`,
      platform: 'Windows',
      desc: 'x64',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" style="color: var(--color-fg)"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>',
    },
  ];

  return `<div class="mb-6 rounded-2xl border overflow-hidden" style="background-color: var(--color-surface); border-color: var(--color-border);">
    <div class="flex items-center gap-3 px-6 py-4 border-b" style="border-color: var(--color-border);">
      <h3 class="text-lg font-bold">阿里云 下载</h3>
      <span class="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">OSS</span>
      <span class="ml-auto text-xs" style="color: var(--color-muted)">版本 ${appVersion}</span>
    </div>
    <div class="px-6 py-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        ${mainlandAssets.map((asset) => `
          <a href="${buildOssDownloadUrl(asset.name)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-indigo-500/50" style="border-color: var(--color-border);">
            ${asset.icon}
            <div>
              <div class="text-sm font-semibold">${asset.name}</div>
              <div class="text-xs" style="color: var(--color-muted)">${asset.platform} · ${asset.desc} · 阿里云</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  </div>`;
}

const features = [
  {
    id: 'rename', name: '批量重命名', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>', color: 'var(--color-syn-blue)',
    description: '告别正则和命令行，像搭积木一样拖拽组合 10 种命名规则，所有改动实时预览，零基础也能秒上手。',
    usp: '告别复杂的正则表达式和命令行操作。悠然工具箱采用可视化规则配置，像搭积木一样组合命名规则，每一步操作都能实时预览结果。即使是零基础的用户，也能在几秒内完成批量重命名，比市面上同类工具更加直观友好。',
    highlights: ['可视化规则配置，像搭积木一样组合', '10 种命名规则自由组合，拖拽排序', '实时预览重命名结果，所见即所得', '复制模式保护原文件，操作可逆', '支持手动编辑单个文件名'],
    snippet: { title: '重命名预览', lines: [
      { text: 'IMG_001.jpg → 2024-01-30_旅行_1920x1080_01.jpg', color: 'var(--color-syn-blue)' },
      { text: 'IMG_002.jpg → 2024-01-30_旅行_3840x2160_02.jpg', color: 'var(--color-syn-blue)' },
      { text: 'IMG_003.jpg → 2024-01-30_旅行_4032x3024_03.jpg', color: 'var(--color-syn-blue)' },
      { text: '' },
      { text: '✓ 3 个文件重命名完成', color: 'var(--color-syn-green)' },
    ]},
    example: { type: 'rules', title: '示例：将旅行照片按日期 + 主题 + 像素 + 序号重命名', rules: [
      { label: '修改时间', color: 'var(--color-syn-orange)', value: '2024-01-30' },
      { label: '连接符', color: 'var(--color-muted)', value: '_' },
      { label: '文本', color: 'var(--color-syn-green)', value: '旅行' },
      { label: '连接符', color: 'var(--color-muted)', value: '_' },
      { label: '像素尺寸', color: 'var(--color-syn-red)', value: '1920x1080' },
      { label: '连接符', color: 'var(--color-muted)', value: '_' },
      { label: '序号', color: 'var(--color-syn-blue)', value: '01' },
    ], result: '2024-01-30_旅行_1920x1080_01.jpg' },
    details: [
      { title: '命名规则类型', items: ['序号：自定义起始值和位数（如 001、002、003）', '文本：插入任意自定义文本内容', '当前时间：支持年月日时分秒多种精度和分隔符格式', '创建时间：使用文件的创建时间属性', '修改时间：使用文件的修改时间属性', '文件大小：支持自动/B/KB/MB/GB/TB 单位，可选是否显示单位', '像素尺寸：支持宽高、仅宽度、仅高度、宽高比四种模式，连接符可选 x/X/*/-/_/.', '原名称：完整保留、查找替换、按位置截取三种模式', '连接符：15 种常用分隔符（-、_、.、(、)、[、] 等）', '随机字符串：可配置长度 1-32 位，支持数字、大小写字母组合'] },
      { title: '文件管理', items: ['支持多文件批量选择', '按名称、大小、创建时间、修改时间排序（升序/降序）', '1-6 列网格显示，灵活调整布局', '默认显示 4 行，可展开查看全部文件', '点击预览名称可单独手动修改（扩展名自动保留）'] },
      { title: '输出模式', items: ['直接重命名：原地修改文件名', '原地复制：在原目录创建重命名后的副本', '归档复制：复制到指定目录，支持新建子文件夹'] },
    ],
    workflow: ['选择需要重命名的文件', '添加命名规则并拖拽调整顺序', '点击规则标签编辑参数', '实时预览新文件名，可手动编辑特殊文件', '选择输出模式（直接重命名/复制）', '执行重命名，查看处理结果'],
  },
  {
    id: 'classify', name: '分类归档', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>', color: 'var(--color-syn-green)',
    description: '选好分类列一键归档，上千条 Excel 数据自动拆分到不同 Sheet 或独立文件，完美保留合并单元格和列宽。',
    usp: '告别手动筛选复制粘贴的繁琐操作。只需选择分类列，一键即可将上千条数据自动归类。支持输出为多个 Sheet 或独立文件，完美保留原始表格格式，是行政、财务、HR 等岗位的效率利器。',
    highlights: ['选择分类列即可一键归档，零门槛', '支持批量处理多个 Excel 文件', '完美保留合并单元格和列宽', '统一设置或单独设置模式', '详细的分类统计报告'],
    snippet: { title: '分类归档结果', lines: [
      { text: '文件：销售数据.xlsx', color: 'var(--color-fg)' },
      { text: '分类列：部门', color: 'var(--color-fg)' },
      { text: '' },
      { text: '├── 市场部　→ 128 条', color: 'var(--color-syn-green)' },
      { text: '├── 技术部　→ 96 条', color: 'var(--color-syn-blue)' },
      { text: '├── 销售部　→ 215 条', color: 'var(--color-syn-orange)' },
      { text: '└── 总计　　→ 439 条 ✓', color: 'var(--color-syn-purple)' },
    ]},
    example: { type: 'table', title: '示例：按「部门」列将员工数据分类归档',
      headers: ['姓名', '部门', '职位', '入职日期'],
      rows: [['张三', '市场部', '经理', '2022-03-15'], ['李四', '技术部', '工程师', '2023-01-10'], ['王五', '市场部', '专员', '2023-06-20'], ['赵六', '技术部', '设计师', '2022-11-05'], ['钱七', '销售部', '主管', '2021-08-12']],
    },
    details: [
      { title: '文件处理', items: ['支持 .xlsx 和 .xls 格式', '支持同时选择多个 Excel 文件批量处理', '自动读取并显示文件的列信息'] },
      { title: '设置模式', items: ['统一设置：所有文件使用相同的分类列和表头行数，仅显示共有列', '单独设置：每个文件独立配置分类列和表头行数', '表头行数：1-10 行可选，分类后自动保留为表头'] },
      { title: '分类方式', items: ['新建 Sheet：每个分类作为原文件的一个新 Sheet，保留原始数据在「全部」Sheet', '独立文件：每个分类生成独立的 Excel 文件，文件名为分类值'] },
      { title: '输出设置', items: ['自定义输出目录，支持新建子文件夹', '可设置文件名前缀和后缀', '自动保留原始合并单元格和列宽', '跳过分类列为空的行，数据校验确保条数一致'] },
    ],
    workflow: ['添加一个或多个 Excel 文件', '选择统一设置或单独设置模式', '选择分类依据的列和表头行数', '选择分类方式（新建 Sheet / 独立文件）', '设置输出目录和文件名', '开始处理，查看分类统计和明细'],
  },
  {
    id: 'image', name: '图片压缩', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>', color: 'var(--color-syn-purple)',
    description: '图片全程不离开本机，支持 JPEG/PNG/WebP 互转，每张可独立调参，实时显示压缩率对比。',
    usp: '无需上传到在线压缩网站，你的图片全程不离开本机。支持批量处理，每张图片可独立配置参数，实时显示压缩前后的大小对比和压缩率，让你精确掌控画质与体积的平衡。',
    highlights: ['本地处理，图片不上传到任何服务器', '支持 JPEG/PNG/WebP 格式互转', '可调节压缩质量 1%-100%', '每张图片可独立配置参数', '实时显示压缩率和大小对比'],
    snippet: { title: '压缩结果', lines: [
      { text: 'photo_01.jpg　2.4 MB → 320 KB　↓86.7%', color: 'var(--color-syn-green)' },
      { text: 'photo_02.png　5.1 MB → 890 KB　↓82.9%', color: 'var(--color-syn-green)' },
      { text: 'banner.webp　 1.8 MB → 245 KB　↓86.7%', color: 'var(--color-syn-green)' },
      { text: '──────────────────────────' },
      { text: '总计：9.3 MB → 1.4 MB，节省 84.9%', color: 'var(--color-syn-yellow)' },
    ]},
    example: { type: 'before-after', title: '示例：批量压缩产品图片',
      before: { label: '压缩前', items: ['photo_01.jpg — 2.4 MB', 'photo_02.png — 5.1 MB', 'banner.webp — 1.8 MB', '合计 9.3 MB'] },
      after: { label: '压缩后（质量 75%）', items: ['photo_01.jpg — 320 KB ↓86.7%', 'photo_02.png — 890 KB ↓82.9%', 'banner.webp — 245 KB ↓86.7%', '合计 1.4 MB，节省 84.9%'] },
    },
    details: [
      { title: '处理模式', items: ['压缩图片：减小文件大小，保持或转换格式', '转换格式：主要用于格式转换，保持高质量'] },
      { title: '处理参数', items: ['压缩质量：1%-100%，建议保持在 60%-80%', '最大宽度：超过此值时等比缩小，原图较小不会放大', '输出格式：保持原格式 / JPEG / PNG / WebP'] },
      { title: '设置模式', items: ['统一设置：所有图片使用相同参数', '单独设置：每张图片独立配置压缩质量、宽度和格式'] },
      { title: '输出方式', items: ['浏览器下载：直接通过浏览器下载处理后的文件', '原地复制：处理后的文件放在原文件相同目录', '归档复制：统一存放到指定文件夹'] },
    ],
    workflow: ['选择压缩或转换模式', '添加图片文件', '调整压缩质量、最大宽度和输出格式', '选择输出方式', '开始处理，查看压缩率和文件大小对比', '全部保存或逐个下载'],
  },
  {
    id: 'pdf', name: 'PDF 工具', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M11 18h2"/><path d="M12 12v6"/><path d="M9 13v-.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v.5"/></svg>', color: 'var(--color-syn-orange)',
    description: '无需安装 Adobe，本地即可合并多个 PDF 或按页码范围灵活拆分，拖拽调整顺序，处理完自动下载。',
    usp: '无需安装 Adobe Acrobat 等重量级软件，也不用把文件上传到在线 PDF 工具网站。本地即可完成 PDF 的合并与拆分，操作简单直接，支持灵活的页码范围设置。',
    highlights: ['本地处理，PDF 内容不外泄', '多文件合并，拖拽调整顺序', '按页或按范围灵活拆分', '自定义页码范围（如 1-3, 5, 7-10）', '处理完成自动下载'],
    snippet: { title: '操作示例', lines: [
      { text: '合并 PDF', color: 'var(--color-syn-blue)' },
      { text: '报告.pdf + 附录.pdf + 封面.pdf', color: 'var(--color-fg)' },
      { text: '→ merged.pdf（共 42 页）', color: 'var(--color-syn-green)' },
      { text: '' },
      { text: '拆分 PDF', color: 'var(--color-syn-orange)' },
      { text: '文档.pdf，页码范围：1-3, 5, 7-10', color: 'var(--color-fg)' },
      { text: '→ 3 个独立文件', color: 'var(--color-syn-green)' },
    ]},
    example: { type: 'before-after', title: '示例：合并多个 PDF 文件',
      before: { label: '合并前（3 个文件）', items: ['封面.pdf — 1 页', '报告.pdf — 35 页', '附录.pdf — 6 页'] },
      after: { label: '合并后（1 个文件）', items: ['merged.pdf — 共 42 页', '按封面 → 报告 → 附录顺序排列', '自动下载到本地'] },
    },
    details: [
      { title: '合并 PDF', items: ['支持选择多个 PDF 文件', '显示每个文件的页数', '通过上移/下移按钮调整合并顺序', '支持删除不需要的文件', '合并后按顺序排列，输出 merged.pdf'] },
      { title: '拆分 PDF', items: ['每页一个文件：将每一页拆分为独立 PDF（page_1.pdf、page_2.pdf...）', '按范围拆分：自定义页码范围，格式如 1-3, 5, 7-10', '支持单页和范围混合使用', '自动验证页码范围有效性', '处理完成后自动下载'] },
    ],
    workflow: ['选择合并或拆分模式', '合并：添加多个 PDF 文件并调整顺序', '拆分：选择一个 PDF 文件并设置拆分方式', '点击执行，自动下载处理结果'],
  },
  {
    id: 'qrcode', name: '二维码', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>', color: 'var(--color-syn-yellow)',
    description: '不只是黑白码，24 种配色、5 种码点样式、支持添加 Logo，内置识别测试确保扫码可靠。',
    usp: '不只是简单的黑白二维码生成器。提供 24 种精心设计的配色方案、多种码点和定位点样式，还能添加品牌 Logo。内置识别测试功能，确保生成的二维码在美观的同时保持可靠的识别率。',
    highlights: ['24 种预设配色 + 自定义颜色', '5 种码点和定位点样式', '支持添加品牌 Logo', '内置识别测试，确保可用性', '从图片或剪贴板识别二维码'],
    snippet: { title: '生成配置', lines: [
      { text: '内容：https://example.com', color: 'var(--color-fg)' },
      { text: '尺寸：300 × 300 像素', color: 'var(--color-fg)' },
      { text: '容错级别：H（30%）', color: 'var(--color-syn-yellow)' },
      { text: '码点样式：圆角', color: 'var(--color-syn-purple)' },
      { text: 'Logo：company-logo.png', color: 'var(--color-syn-green)' },
      { text: '' },
      { text: '✓ 识别测试通过', color: 'var(--color-syn-green)' },
    ]},
    example: { type: 'before-after', title: '示例：生成品牌二维码',
      before: { label: '基础配置', items: ['内容：https://example.com', '配色：蓝色方案', '样式：圆角码点'] },
      after: { label: '高级定制', items: ['添加品牌 Logo', '容错级别 H（30%）', '自定义定位点样式', '测试识别通过 ✓'] },
    },
    details: [
      { title: '生成设置', items: ['输入内容：支持文本、网址等任意内容', '尺寸：可调节二维码大小（像素）', '容错级别：L(7%)、M(15%)、Q(25%)、H(30%)', '边距：调节二维码周围的空白区域'] },
      { title: '配色方案', items: ['24 种预设配色：经典黑白、蓝色、绿色、紫色、红色等', '随机配色：一键生成随机颜色组合', '自定义颜色：前景色、背景色、定位点颜色', '支持 16 进制（#RGB/#RRGGBB）和 RGB 值输入'] },
      { title: '样式设置', items: ['码点形状：方形、圆角、超圆角、经典', '定位点形状：方正、圆角、中圆角、细圆角、粗圆形', '随机样式：一键随机生成样式组合'] },
      { title: 'Logo 设置', items: ['选择 Logo 图片文件', '大小：占二维码的百分比', '圆角：Logo 的圆角百分比', '边距：Logo 周围的白色边距', '建议使用 H 级容错 + 较小 Logo + 简单形状'] },
      { title: '识别二维码', items: ['上传图片：选择二维码图片文件识别', '粘贴图片：Ctrl+V / ⌘V 粘贴剪贴板图片', '显示识别结果，支持一键复制'] },
    ],
    workflow: ['输入二维码内容', '选择配色方案或自定义颜色', '调整尺寸、容错级别和样式', '添加 Logo（可选）', '测试识别验证可用性', '下载或复制到剪贴板'],
  },
  {
    id: 'textdiff', name: '文本对比', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>', color: 'var(--color-syn-cyan)',
    description: '输入即出结果，字符/单词/行三种粒度，红绿高亮一目了然，适合校对文案和检查配置。',
    usp: '快速发现两段文本之间的细微差异。三种对比粒度满足不同场景需求，绿色标注新增、红色标注删除，一目了然。适合校对文案、对比配置文件、检查代码修改等场景。',
    highlights: ['三种对比粒度：字符/单词/行', '实时对比，输入即出结果', '红绿高亮直观展示差异', '新增/删除/未变字符统计', '一键交换文本和复制结果'],
    snippet: { title: '对比结果', lines: [
      { text: '对比模式：按字符', color: 'var(--color-fg)' },
      { text: '' },
      { text: '原文：悠然工具箱 v0.0.6', color: 'var(--color-syn-red)' },
      { text: '修改：悠然工具箱 v0.0.7', color: 'var(--color-syn-green)' },
      { text: '──────────────────' },
      { text: '新增 1 字符 · 删除 1 字符 · 未变 9 字符', color: 'var(--color-syn-cyan)' },
    ]},
    example: { type: 'before-after', title: '示例：校对文案修改',
      before: { label: '原始文本', items: ['悠然工具箱是一款轻量级工具', '支持 macOS 和 Windows', '版本 v0.0.6'] },
      after: { label: '修改后文本', items: ['悠然工具箱是一款轻量级桌面工具集', '支持 macOS 和 Windows 双平台', '版本 v0.0.7'] },
    },
    details: [
      { title: '对比模式', items: ['按字符：精确到每个字符的变化，适合细微修改', '按单词：以空格分隔的单词为单位，适合文本编辑', '按行：以换行符分隔，适合代码或配置文件对比'] },
      { title: '结果展示', items: ['新增内容：绿色背景高亮显示', '删除内容：红色背景高亮 + 删除线', '未变内容：正常显示', '统计信息：新增字符数、删除字符数、未变字符数'] },
      { title: '操作功能', items: ['交换：一键交换左右两侧文本', '清空：清空所有输入内容', '复制：一键复制对比结果文本', '实时对比：输入变化时自动更新结果'] },
    ],
    workflow: ['在左侧输入原始文本', '在右侧输入修改后文本', '选择对比模式（字符/单词/行）', '查看颜色高亮的差异结果', '复制结果或交换文本继续对比'],
  },
  {
    id: 'heatmap', name: '数据热力图', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>', color: 'var(--color-syn-red)',
    description: '从 Excel 直接粘贴数据即可生成专业热力图，10 种配色、一键转置，支持导出 1x/2x/3x 高清 PNG。',
    usp: '无需学习复杂的图表库或编程语言，从 Excel 复制表格数据直接粘贴即可生成专业热力图。支持实时编辑数据和标签，10 种精心设计的配色方案，XY 轴一键切换，还能导出 1x/2x/3x 高清 PNG 图片，轻松满足汇报和论文需求。',
    highlights: ['从 Excel 直接粘贴数据，零门槛', '10 种预设配色 + 自定义颜色', 'XY 轴一键切换（矩阵转置）', '格子大小、间距、标签角度灵活调节', '导出 1x/2x/3x 高清 PNG 图片'],
    snippet: { title: '热力图配置', lines: [
      { text: '数据：12 × 8 矩阵', color: 'var(--color-fg)' },
      { text: '配色：紫色方案', color: 'var(--color-syn-purple)' },
      { text: '格子：48 × 32 像素', color: 'var(--color-fg)' },
      { text: '标签角度：-45°', color: 'var(--color-fg)' },
      { text: '' },
      { text: '✓ 已导出 heatmap.png（2x）', color: 'var(--color-syn-green)' },
    ]},
    example: { type: 'before-after', title: '示例：从 Excel 生成销售热力图',
      before: { label: 'Excel 原始数据', items: ['Tab 分隔的表格数据', '第一行为列标签', '第一列为行标签', '其余为数值'] },
      after: { label: '生成热力图', items: ['自动识别行列标签', '数值越大颜色越深', '0 值显示为透明', '一键导出高清 PNG'] },
    },
    details: [
      { title: '数据输入', items: ['从 Excel 复制表格数据，粘贴（Ctrl+V / Cmd+V）即可', '第一行首格留空，后续为列标签（Y 轴）', '第一列为行标签（X 轴），其余为数值', '粘贴后可直接在表格中编辑标签和数值', '值为 0 的格子显示为透明'] },
      { title: '颜色配置', items: ['10 种预设配色：紫色、蓝色、绿色、红色、橙色、青绿、粉色、靛蓝、琥珀、青色', '支持自定义颜色拾取', '数值越大颜色越深（透明度从 15% 到 100% 线性映射）', '文字颜色根据背景亮度自动切换黑白'] },
      { title: '布局设置', items: ['格子宽度：28-80 像素可调', '格子高度：20-60 像素可调', '格子间距：0-4 像素五档可选', 'X 轴标签角度：-90° 到 -15° 共 11 档', '图表标题、X/Y 轴标题、图例标题均可自定义', 'XY 轴一键切换（矩阵转置）'] },
      { title: '图例', items: ['竖向渐变色条展示数值范围', '自动计算整洁刻度线（Nice Ticks）', '始终包含 0，刻度约等分为 5 格'] },
      { title: '导出图片', items: ['图片内边距：0-60 像素可调', '导出倍图：1x / 2x / 3x 三档', '白色背景 PNG 格式', '通过系统对话框选择保存路径'] },
    ],
    workflow: ['从 Excel 复制数据并粘贴到页面', '选择配色方案或自定义颜色', '调整格子大小、间距和标签角度', '添加图表标题和轴标题（可选）', '点击导出，选择倍图和保存路径'],
  },
];

const techs = [
  { name: 'Svelte', description: '新一代响应式前端框架', color: '#ff3e00', icon: '/svelte-icon.svg' },
  { name: 'Tauri', description: '轻量级跨平台桌面框架', color: '#ffc131', icon: '/tauri.svg' },
  { name: 'Rust', description: '高性能系统级后端', color: '#dea584', icon: '/rust.svg' },
  { name: 'Vite', description: '下一代前端构建工具', color: '#bd34fe', icon: '/vitejs.svg' },
  { name: 'Tailwind', description: '原子化 CSS 框架', color: '#06b6d4', icon: '/tailwindcss-icon.svg' },
];

const guideTips = {
  rename: ['建议先开启复制模式，确认结果后再直接重命名。', '预览名称支持手动改名，适合处理少量特殊文件。'],
  classify: ['先确认表头行数，再选择分类列，结果会更准确。', '分类值为空的行会被跳过，可在统计区查看数量。'],
  image: ['压缩模式建议质量在 60% 到 80% 之间。', '转换模式会保留原图，适合批量统一图片格式。'],
  pdf: ['合并前先调整顺序，导出的页面顺序会完全一致。', '页码范围支持单页与区间混合，例如 1-3，5，7-10。'],
  qrcode: ['添加 Logo 后建议执行一次识别测试。', '识别模式支持上传图片，也支持快捷键粘贴截图。'],
  textdiff: ['短文案推荐按字符，长文本推荐按行。', '对比结果可一键复制，便于粘贴到文档或消息。'],
  heatmap: ['从 Excel 粘贴时，第一行首格留空，第一列为行标签。', '导出前可调整内边距和倍图，便于报告或打印。'],
};

// 渲染功能卡片
function renderFeatureCards() {
  const container = document.getElementById('feature-cards');
  container.innerHTML = features.map((f) => {
    const localized = getLocalizedFeatureBasics(f);
    const localizedDetail = getLocalizedFeatureDetail(f);
    const highlights = localizedDetail.highlights.slice(0, 3);
    const highlightsHtml = `<ul class="mt-3 space-y-1">${highlights.map(h => `<li class="flex items-start gap-1.5 text-xs" style="color: var(--color-muted)"><span style="color: ${f.color}" class="mt-0.5 shrink-0">·</span>${h}</li>`).join('')}</ul>`;
    return `
    <a href="#guide" data-page="guide" data-scroll-to="${f.id}-detail" class="feature-card nav-link group rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 block no-underline w-full md:w-[calc(50%-0.75rem)]"
      style="background-color: var(--color-surface); border-color: var(--color-border);" data-color="${f.color}">
      <div class="mb-2 flex items-center gap-3">
        <span style="color: ${f.color}">${f.icon}</span>
        <h3 class="text-lg font-bold" style="color: ${f.color}">${localized.name}</h3>
      </div>
      <p class="text-sm leading-relaxed" style="color: var(--color-muted)">${localized.desc}</p>
      ${highlightsHtml}
    </a>
  `;
  }).join('');
}

// 渲染预览卡片
function renderPreviewCard(snippet, color) {
  return `<div class="overflow-hidden rounded-xl border" style="background-color: var(--color-surface); border-color: var(--color-border);">
    <div class="border-b px-4 py-2.5" style="border-color: var(--color-border);">
      <span class="text-xs font-bold" style="color: ${color}">${snippet.title}</span>
    </div>
    <div class="p-4 text-sm leading-7">
      ${snippet.lines.map(line => `<div style="color: ${line.color || 'var(--color-fg)'}">${line.text || '&nbsp;'}</div>`).join('')}
    </div>
  </div>`;
}

// 渲染示例区块
function renderExample(feature) {
  const ex = feature.example;
  if (ex.type === 'rules') {
    const rulesHtml = ex.rules.map((r, i) => {
      const plus = i < ex.rules.length - 1 ? '<span class="text-xs" style="color: var(--color-muted)">+</span>' : '';
      return `<span class="rounded px-2 py-0.5 text-xs font-semibold" style="background-color: color-mix(in srgb, ${r.color} 15%, transparent); color: ${r.color}; border: 1px solid color-mix(in srgb, ${r.color} 30%, transparent);">${r.label}</span>${plus}`;
    }).join('');
    return `<div class="mb-6 rounded-xl border p-4" style="background-color: var(--color-surface); border-color: var(--color-border);">
      <h4 class="mb-3 text-xs font-bold" style="color: ${feature.color}">${ex.title}</h4>
      <div class="mb-3 flex flex-wrap items-center gap-1.5">${rulesHtml}</div>
      <div class="flex items-center gap-2">
        <span class="text-xs" style="color: var(--color-muted)">${t('guideResultLabel')}</span>
        <code class="font-mono rounded px-2 py-0.5 text-xs font-bold" style="background-color: color-mix(in srgb, ${feature.color} 10%, transparent); color: ${feature.color};">${ex.result}</code>
      </div>
    </div>`;
  }
  if (ex.type === 'table') {
    const groups = [...new Set(ex.rows.map(r => r[1]))];
    return `<div class="mb-6 rounded-xl border overflow-hidden" style="border-color: var(--color-border);">
      <div class="px-4 py-2.5 text-xs font-bold" style="background-color: var(--color-surface); color: ${feature.color}">${ex.title}</div>
      <div class="px-4 py-2 text-xs font-bold" style="color: var(--color-muted)">${t('guideSourceData')}</div>
      <div class="overflow-x-auto px-4 pb-2"><table class="w-full text-xs">
        <thead><tr>${ex.headers.map(h => `<th class="border-b px-3 py-1.5 text-left font-semibold" style="border-color: var(--color-border); color: var(--color-fg)">${h}</th>`).join('')}</tr></thead>
        <tbody>${ex.rows.map(row => `<tr>${row.map((cell, ci) => `<td class="border-b px-3 py-1.5" style="border-color: var(--color-border); color: ${ci === 1 ? feature.color : 'var(--color-muted)'}; font-weight: ${ci === 1 ? '600' : '400'}">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <div class="border-t px-4 py-2 text-xs font-bold" style="border-color: var(--color-border); color: var(--color-muted)">${t('guideClassifiedAfterPrefix')}「${ex.headers[1]}」</div>
      <div class="px-4 pb-3"><div class="flex flex-wrap gap-2">
        ${groups.map(g => `<span class="rounded-md px-2.5 py-1 text-xs" style="background-color: color-mix(in srgb, ${feature.color} 12%, transparent); color: ${feature.color}; border: 1px solid color-mix(in srgb, ${feature.color} 25%, transparent);">${g} → ${ex.rows.filter(r => r[1] === g).length} ${t('guideItemUnit')}</span>`).join('')}
      </div></div>
    </div>`;
  }
  if (ex.type === 'before-after') {
    return `<div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-xl border p-3" style="background-color: var(--color-surface); border-color: var(--color-border);">
        <div class="mb-2 text-xs font-bold" style="color: var(--color-syn-red)">${ex.before.label}</div>
        <ul class="space-y-1">${ex.before.items.map(item => `<li class="font-mono text-xs" style="color: var(--color-muted)">${item}</li>`).join('')}</ul>
      </div>
      <div class="rounded-xl border p-3" style="background-color: var(--color-surface); border-color: color-mix(in srgb, ${feature.color} 40%, transparent);">
        <div class="mb-2 text-xs font-bold" style="color: var(--color-syn-green)">${ex.after.label}</div>
        <ul class="space-y-1">${ex.after.items.map(item => `<li class="font-mono text-xs" style="color: var(--color-fg)">${item}</li>`).join('')}</ul>
      </div>
    </div>`;
  }
  return '';
}

function renderGuideIntro() {
  const introSteps = t('guideIntroSteps') || [];
  const quickJump = features.map(f => `
    <a href="#guide/${f.id}-detail" data-page="guide" data-scroll-to="${f.id}-detail"
      class="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/40"
      style="border-color: var(--color-border); color: ${f.color}; background-color: color-mix(in srgb, ${f.color} 12%, transparent);">
      ${getLocalizedFeatureBasics(f).name}
    </a>
  `).join('');

  return `<div class="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
    <div class="rounded-xl border p-5" style="border-color: var(--color-border); background-color: var(--color-surface);">
      <h3 class="mb-3 text-base font-bold" style="color: var(--color-fg)">${t('guideIntroTitle')}</h3>
      <ol class="space-y-2 text-sm" style="color: var(--color-muted)">
        ${introSteps.map((step, index) => `<li><span class="mr-2 font-mono" style="color: var(--color-syn-blue)">${index + 1}.</span>${step}</li>`).join('')}
      </ol>
    </div>
    <div class="rounded-xl border p-5" style="border-color: var(--color-border); background-color: var(--color-surface);">
      <h3 class="mb-3 text-base font-bold" style="color: var(--color-fg)">${t('guideJumpTitle')}</h3>
      <div class="flex flex-wrap gap-2">${quickJump}</div>
    </div>
  </div>`;
}

// 渲染功能详情
function renderFeatureDetails() {
  const container = document.getElementById('feature-details');
  const sections = features.map((f) => {
    const localizedBasics = getLocalizedFeatureBasics(f);
    const localizedDetail = getLocalizedFeatureDetail(f);
    const workflowHtml = localizedDetail.workflow.map((step, si) =>
      `<li class="flex items-start gap-2 text-sm"><span class="font-mono shrink-0 font-bold" style="color: ${f.color}">${si + 1}.</span><span style="color: var(--color-muted)">${step}</span></li>`
    ).join('');

    const highlightsHtml = localizedDetail.highlights.map(h =>
      `<li class="flex items-start gap-1.5 text-sm" style="color: var(--color-fg)"><span style="color: ${f.color}" class="mt-0.5 shrink-0">·</span>${h}</li>`
    ).join('');

    const detailsHtml = localizedDetail.details.map(d => `
      <details class="rounded-lg border p-4" style="border-color: var(--color-border); background-color: color-mix(in srgb, var(--color-surface) 65%, var(--color-bg));">
        <summary class="cursor-pointer text-sm font-semibold" style="color: ${f.color}">${d.title}</summary>
        <ul class="mt-3 space-y-1.5">${d.items.map(item => `<li class="text-sm leading-relaxed" style="color: var(--color-fg)"><span style="color: ${f.color}" class="mr-1">·</span>${item}</li>`).join('')}</ul>
      </details>
    `).join('');

    const tips = localizedDetail.tips.map(tip =>
      `<li class="flex items-start gap-1.5 text-sm" style="color: var(--color-muted)"><span style="color: ${f.color}" class="mt-0.5 shrink-0">·</span>${tip}</li>`
    ).join('');

    return `<article id="${f.id}-detail" class="scroll-mt-24 rounded-2xl border p-6 lg:p-7" style="border-color: var(--color-border); background-color: color-mix(in srgb, var(--color-surface) 70%, var(--color-bg));">
        <div class="mb-5 flex items-center gap-3">
          <span style="color: ${f.color}; display: inline-flex;">${f.icon.replace('width="24"', 'width="30"').replace('height="24"', 'height="30"')}</span>
          <h3 class="text-2xl font-bold" style="color: ${f.color}">${localizedBasics.name}</h3>
        </div>
        <p class="mb-5 text-sm leading-relaxed" style="color: var(--color-muted)">${localizedBasics.desc}</p>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div class="mb-4 rounded-lg border p-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
            <h4 class="mb-2 text-sm font-bold" style="color: ${f.color}">${t('guideSectionCore')}</h4>
            <ul class="space-y-1.5">${highlightsHtml}</ul>
          </div>
          <div class="mb-4 rounded-lg border p-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
            <h4 class="mb-2 text-sm font-bold" style="color: ${f.color}">${t('guideSectionWorkflow')}</h4>
            <ol class="space-y-1.5">${workflowHtml}</ol>
          </div>
          ${renderExample(localizedDetail)}
          <div class="mb-4 space-y-3">
            <h4 class="text-sm font-bold" style="color: ${f.color}">${t('guideSectionSettings')}</h4>
            ${detailsHtml}
          </div>
          <div class="rounded-lg border p-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
            <h4 class="mb-2 text-sm font-bold" style="color: ${f.color}">${t('guideSectionTips')}</h4>
            <ul class="space-y-1.5">${tips}</ul>
          </div>
        </div>
        <div>${renderPreviewCard(localizedDetail.snippet, f.color)}</div>
      </div>
    </article>`;
  }).join('');

  container.innerHTML = `${renderGuideIntro()}<div class="space-y-8">${sections}</div>`;
}

// 渲染技术栈
function renderTechStack() {
  const container = document.getElementById('tech-grid');
  const techDescriptions = {
    Svelte: t('techDescSvelte'),
    Tauri: t('techDescTauri'),
    Rust: t('techDescRust'),
    Vite: t('techDescVite'),
    Tailwind: t('techDescTailwind'),
  };
  container.innerHTML = techs.map(t => `
    <div class="tech-card flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-300 hover:-translate-y-1"
      style="background-color: var(--color-surface); border-color: var(--color-border);" data-color="${t.color}">
      <div style="color: ${t.color}"><img src="${t.icon}" alt="${t.name}" class="w-7 h-7" /></div>
      <div>
        <div class="text-sm font-bold" style="color: var(--color-fg)">${t.name}</div>
        <div class="mt-1 text-xs" style="color: var(--color-muted)">${techDescriptions[t.name] || t.description}</div>
      </div>
    </div>
  `).join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el || !value) return;
  el.textContent = value;
}

let originalFaqHtml = '';
let originalPrivacyHtml = '';
let originalPlatformNoteHtml = '';

function renderLocalizedStaticSections() {
  const faqContainer = document.querySelector('#faq .space-y-3');
  const privacyContainer = document.querySelector('#page-privacy .prose');
  const platformNoteContainer = document.getElementById('downloads-platform-note');
  if (faqContainer && !originalFaqHtml) originalFaqHtml = faqContainer.innerHTML;
  if (privacyContainer && !originalPrivacyHtml) originalPrivacyHtml = privacyContainer.innerHTML;
  if (platformNoteContainer && !originalPlatformNoteHtml) originalPlatformNoteHtml = platformNoteContainer.innerHTML;

  if (isFullGuideLocale()) {
    if (faqContainer && originalFaqHtml) faqContainer.innerHTML = originalFaqHtml;
    if (privacyContainer && originalPrivacyHtml) privacyContainer.innerHTML = originalPrivacyHtml;
    if (platformNoteContainer && originalPlatformNoteHtml) platformNoteContainer.innerHTML = originalPlatformNoteHtml;
    setupFaqCommandCopy();
    setupFaqToggleAnimation();
    return;
  }

  if (faqContainer) {
    const windowsItems = (t('faqWindowsItems') || []).map((item) => `<li>${item}</li>`).join('');
    faqContainer.innerHTML = `
      <details class="rounded-2xl border px-5 py-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
        <summary class="faq-summary flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold" style="color: var(--color-fg);">
          <span>${t('faqMacTitle')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron lucide lucide-chevron-right-icon lucide-chevron-right shrink-0"><path d="m9 18 6-6-6-6"/></svg>
        </summary>
        <div class="faq-content">
          <div class="faq-content-inner pt-3 text-sm leading-relaxed" style="color: var(--color-muted);">
            <p>${t('faqMacExplain')}</p>
            <p class="mt-2">${t('faqMacCmdHint1')}</p>
            <pre class="mt-2 flex items-center gap-2 overflow-x-auto rounded-lg border p-3" style="border-color: var(--color-border); background-color: color-mix(in srgb, var(--color-surface) 70%, transparent);"><span aria-hidden="true" class="select-none text-neutral-400">$</span><code class="whitespace-nowrap">${t('faqMacCmd')}</code></pre>
            <p class="mt-2">${t('faqMacCmdHint2')}</p>
            <pre class="mt-2 flex items-center gap-2 overflow-x-auto rounded-lg border p-3" style="border-color: var(--color-border); background-color: color-mix(in srgb, var(--color-surface) 70%, transparent);"><span aria-hidden="true" class="select-none text-neutral-400">$</span><code class="whitespace-nowrap">${t('faqMacCmd2')}</code></pre>
            <p class="mt-2">${t('faqMacPathNote')}</p>
          </div>
        </div>
      </details>
      <details class="rounded-2xl border px-5 py-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
        <summary class="faq-summary flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold" style="color: var(--color-fg);">
          <span>${t('faqWindowsTitle')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron lucide lucide-chevron-right-icon lucide-chevron-right shrink-0"><path d="m9 18 6-6-6-6"/></svg>
        </summary>
        <div class="faq-content">
          <div class="faq-content-inner pt-3 text-sm leading-relaxed" style="color: var(--color-muted);">
            <p>${t('faqWindowsIntro')}</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">${windowsItems}</ul>
          </div>
        </div>
      </details>
    `;
  }

  if (privacyContainer) {
    const privacyItems = (t('privacyDataItems') || []).map((item) => `<li>${item}</li>`).join('');
    const privacyFileItems = (t('privacyFileAccessItems') || []).map((item) => `<li>${item}</li>`).join('');
    privacyContainer.innerHTML = `
      <h2>${t('privacyOverviewTitle')}</h2>
      <p>${t('privacyOverviewDesc')}</p>
      <h2>${t('privacyDataTitle')}</h2>
      <ul>${privacyItems}</ul>
      <h2>${t('privacyFileAccessTitle')}</h2>
      <ul>${privacyFileItems}</ul>
      <h2>${t('privacyOpenSourceTitle')}</h2>
      <p>${t('privacyOpenSourceDesc')} <a href="https://github.com/dufu1991/youran-toolbox" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300">GitHub</a></p>
      <h2>${t('privacyUpdateTitle')}</h2>
      <p>${t('privacyUpdateDesc')}</p>
    `;
  }

  if (platformNoteContainer) {
    platformNoteContainer.innerHTML = `
      <p class="mb-1 font-semibold" style="color: var(--color-fg)">${t('platformNoteTitle')}</p>
      <p>${t('platformNoteDesc')}</p>
      <ul class="mt-2 space-y-1 list-disc pl-4">
        <li><b class="text-neutral-300">${t('platformNoteMacLabel')}</b>：${t('platformNoteMacDesc')}</li>
        <li><b class="text-neutral-300">${t('platformNoteWindowsLabel')}</b>：${t('platformNoteWindowsDesc')}</li>
        <li><b class="text-neutral-300">${t('platformNoteLinuxLabel')}</b>：${t('platformNoteLinuxDesc')}</li>
      </ul>
    `;
  }

  setupFaqToggleAnimation();
}

function applySiteLanguage() {
  const localePack = getLocaleBundle();
  const appTexts = localePack.app || {};
  const metaDescription = document.querySelector('meta[name="description"]');

  document.documentElement.lang = currentLocale;
  document.title = `${appTexts.title || 'Youran Toolbox'} - ${t('heroTagline')}`;
  if (metaDescription) metaDescription.setAttribute('content', t('heroTagline'));

  setText('nav-home', t('navHome'));
  setText('nav-guide', appTexts.guide || t('navGuide'));
  setText('nav-changelog', appTexts.changelog || t('navChangelog'));
  setText('nav-privacy', t('navPrivacy'));
  setText('m-nav-home', t('navHome'));
  setText('m-nav-guide', appTexts.guide || t('navGuide'));
  setText('m-nav-changelog', appTexts.changelog || t('navChangelog'));
  setText('m-nav-privacy', t('navPrivacy'));

  setText('hero-title-text', appTexts.title || 'Youran Toolbox');
  setText('brand-title', appTexts.title || 'Youran Toolbox');
  setText('hero-subtitle-text', t('heroTagline'));
  setText('hero-mainland-tip-prefix', t('heroMainlandPrefix'));
  setText('hero-mainland-link-text', t('heroMainlandLink'));
  const heroMainlandLink = document.getElementById('hero-mainland-link');
  if (heroMainlandLink) {
    heroMainlandLink.setAttribute('title', t('heroMainlandLink'));
    heroMainlandLink.setAttribute('aria-label', t('heroMainlandLink'));
  }
  setText('hero-mobile-tip-text', t('mobileTip'));
  setText('hero-support-text', t('supportText'));
  setText('hero-more-download-link', t('moreDownloads'));
  features.forEach((feature) => {
    const chipId = heroChipIdMap[feature.id];
    if (!chipId) return;
    setText(chipId, getLocalizedFeatureBasics(feature).name);
  });
  setText('hero-chip-updating', t('heroChipUpdating'));
  setText('adv-cross-title', t('advCrossTitle'));
  setText('adv-cross-desc', t('advCrossDesc'));
  setText('adv-offline-title', t('advOfflineTitle'));
  setText('adv-offline-desc', t('advOfflineDesc'));
  setText('adv-privacy-title', t('advPrivacyTitle'));
  setText('adv-privacy-desc', t('advPrivacyDesc'));
  setText('adv-simple-title', t('advSimpleTitle'));
  setText('adv-simple-desc', t('advSimpleDesc'));
  setText('adv-theme-title', t('advThemeTitle'));
  setText('adv-theme-desc', t('advThemeDesc'));
  setText('adv-experience-title', t('advExperienceTitle'));
  setText('adv-experience-desc', t('advExperienceDesc'));

  setText('features-title', t('featuresTitle'));
  setText('features-subtitle', t('featuresSubtitle'));
  setText('tech-title', t('techTitle'));
  setText('tech-subtitle', t('techSubtitle'));
  setText('faq-title', t('faqTitle'));
  setText('guide-title', appTexts.guide || t('guideTitle'));
  setText('guide-subtitle', t('guideSubtitle'));
  setText('changelog-title', appTexts.changelog || t('changelogTitle'));
  setText('changelog-subtitle', t('changelogSubtitle'));
  setText('downloads-title', t('downloadsTitle'));
  setText('downloads-subtitle', t('downloadsSubtitle'));
  setText('downloads-loading-text', t('downloadsLoading'));
  setText('downloads-platform-note-title', t('platformNoteTitle'));
  setText('privacy-title', t('privacyTitle'));
  setText('privacy-subtitle', t('privacySubtitle'));
  renderLocalizedStaticSections();
}

function setupLanguageSwitcher() {
  const switcher = document.getElementById('language-switcher');
  const trigger = document.getElementById('language-switcher-trigger');
  const current = document.getElementById('language-switcher-current');
  const menu = document.getElementById('language-switcher-menu');
  if (!switcher || !trigger || !current || !menu) return;

  const closeMenu = () => {
    menu.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    menu.classList.remove('hidden');
    trigger.setAttribute('aria-expanded', 'true');
  };

  const renderOptions = () => {
    const currentLabel = localeBundles[currentLocale]?._meta?.name || currentLocale;
    current.textContent = currentLabel;
    menu.innerHTML = supportedLocales.map((locale) => {
      const label = localeBundles[locale]?._meta?.name || locale;
      const isActive = locale === currentLocale;
      return `<button type="button" role="option" data-locale="${locale}" aria-selected="${isActive ? 'true' : 'false'}" class="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-neutral-300 hover:bg-white/8 hover:text-neutral-100'}">${label}</button>`;
    }).join('');
  };

  const applyLocale = (nextLocale) => {
    if (!supportedLocales.includes(nextLocale) || nextLocale === currentLocale) return;
    currentLocale = nextLocale;
    localStorage.setItem(siteLocaleStorageKey, nextLocale);
    renderOptions();
    applySiteLanguage();
    renderFeatureCards();
    renderFeatureDetails();
    renderTechStack();
    setupSmartDownload();
    loadChangelog();
    loadDownloads();
  };

  renderOptions();

  trigger.addEventListener('click', () => {
    if (menu.classList.contains('hidden')) {
      openMenu();
      return;
    }
    closeMenu();
  });

  menu.addEventListener('click', (event) => {
    const button = event.target.closest('[data-locale]');
    if (!button) return;
    applyLocale(button.getAttribute('data-locale'));
    closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (switcher.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
  });
}

// 卡片悬停效果
function setupHoverEffects() {
  document.addEventListener('mouseenter', (e) => {
    const card = e.target.closest('.feature-card, .tech-card');
    if (!card) return;
    const color = card.dataset.color;
    card.style.borderColor = color;
    if (card.classList.contains('feature-card')) {
      card.style.boxShadow = `0 0 20px color-mix(in srgb, ${color} 15%, transparent)`;
    }
  }, true);
  document.addEventListener('mouseleave', (e) => {
    const card = e.target.closest('.feature-card, .tech-card');
    if (!card) return;
    card.style.borderColor = 'var(--color-border)';
    card.style.boxShadow = 'none';
  }, true);
}

// 移动端菜单
function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.add('hidden'));
  });
}

// 滚动导航栏效果
function setupScrollNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 20;
    nav.style.backgroundColor = scrolled ? 'rgba(10, 10, 10, 0.85)' : 'transparent';
    nav.style.backdropFilter = scrolled ? 'blur(12px)' : 'none';
    nav.style.borderBottomColor = scrolled ? '#262626' : 'transparent';
  });
}

// 页面路由切换
function switchPage(pageId, scrollToId) {
  const pages = document.querySelectorAll('[id^="page-"]');
  pages.forEach(page => {
    page.classList.toggle('hidden', page.id !== `page-${pageId}`);
  });

  // 更新导航栏高亮
  document.querySelectorAll('[data-page]').forEach(link => {
    const isActive = link.dataset.page === pageId;
    link.classList.toggle('text-white', isActive);
    link.classList.toggle('text-neutral-400', !isActive);
  });

  // 滚动到指定锚点或顶部
  if (scrollToId) {
    requestAnimationFrame(() => {
      const target = document.getElementById(scrollToId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  } else {
    window.scrollTo({ top: 0 });
  }
}

function setupRouter() {
  // 点击导航链接切换页面
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (!link) return;
    e.preventDefault();
    const pageId = link.dataset.page;
    const scrollToId = link.dataset.scrollTo;
    location.hash = scrollToId ? `${pageId}/${scrollToId}` : pageId;
  });

  // 监听 hash 变化
  const handleHash = () => {
    const hash = location.hash.slice(1) || 'home';
    const [pageId, scrollToId] = hash.split('/');
    switchPage(pageId, scrollToId);
  };

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

// 加载版本说明
function loadChangelog() {
  const container = document.getElementById('changelog-content');
  container.innerHTML = marked(changelogMd);
}

function getDateLocale() {
  return supportedLocales.includes(currentLocale) ? currentLocale : 'zh-CN';
}

// 检测是否为移动设备
function isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// 检测操作系统
function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Mac')) return 'mac';
  if (ua.includes('Win')) return 'windows';
  return 'other';
}

// 复制文本到剪贴板（降级方案）
function copyByExecCommand(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}

// 首页 brew 命令复制
function setupHeroBrewCopy() {
  const copyBtn = document.getElementById('hero-mac-brew-copy');
  const commandEl = document.getElementById('hero-mac-brew-command');
  if (!copyBtn || !commandEl) return;

  const defaultTitle = copyBtn.getAttribute('title') || '';
  let resetTimer = null;
  const applyCopiedState = () => {
    copyBtn.setAttribute('title', '已复制');
    copyBtn.classList.add('is-copied');
    copyBtn.classList.add('border-green-400/40', 'bg-green-500/10', 'text-green-200');
    copyBtn.classList.remove('border-indigo-400/40', 'bg-indigo-500/10', 'text-indigo-200');
    if (resetTimer) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      if (defaultTitle) copyBtn.setAttribute('title', defaultTitle);
      copyBtn.classList.remove('is-copied');
      copyBtn.classList.remove('border-green-400/40', 'bg-green-500/10', 'text-green-200');
      copyBtn.classList.add('border-indigo-400/40', 'bg-indigo-500/10', 'text-indigo-200');
    }, 1200);
  };

  copyBtn.addEventListener('click', () => {
    const command = commandEl.textContent.trim();
    if (!command) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(command).then(applyCopiedState);
      return;
    }

    if (copyByExecCommand(command)) applyCopiedState();
  });
}

// 常见问题命令复制
function setupFaqCommandCopy() {
  const copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach((copyBtn) => {
    const targetId = copyBtn.getAttribute('data-copy-target');
    const commandEl = targetId ? document.getElementById(targetId) : null;
    if (!commandEl) return;

    const defaultTitle = copyBtn.getAttribute('title') || '';
    let resetTimer = null;
    const applyCopiedState = () => {
      copyBtn.setAttribute('title', '已复制');
      copyBtn.classList.add('is-copied');
      copyBtn.classList.add('border-green-400/40', 'bg-green-500/10', 'text-green-200');
      copyBtn.classList.remove('border-neutral-500/40', 'bg-white/5', 'text-neutral-200');
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (defaultTitle) copyBtn.setAttribute('title', defaultTitle);
        copyBtn.classList.remove('is-copied');
        copyBtn.classList.remove('border-green-400/40', 'bg-green-500/10', 'text-green-200');
        copyBtn.classList.add('border-neutral-500/40', 'bg-white/5', 'text-neutral-200');
      }, 1200);
    };

    copyBtn.addEventListener('click', () => {
      const command = commandEl.textContent.trim();
      if (!command) return;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(command).then(applyCopiedState);
        return;
      }

      if (copyByExecCommand(command)) applyCopiedState();
    });
  });
}

// 常见问题展开收缩动画
function setupFaqToggleAnimation() {
  const faqDetails = document.querySelectorAll('#faq details, #downloads-content details.download-history');
  faqDetails.forEach((detail) => {
    if (detail.dataset.toggleBound === '1') return;
    const summary = detail.querySelector('.faq-summary');
    const content = detail.querySelector('.faq-content');
    if (!summary || !content) return;
    detail.dataset.toggleBound = '1';

    let isAnimating = false;
    content.style.height = detail.open ? 'auto' : '0px';
    content.style.opacity = detail.open ? '1' : '0';

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (isAnimating) return;
      isAnimating = true;

      if (detail.open) {
        detail.classList.add('is-collapsing');
        content.style.height = `${content.scrollHeight}px`;
        content.style.opacity = '1';
        content.offsetHeight;
        content.style.transition = 'height 0.25s ease, opacity 0.2s ease';
        content.style.height = '0px';
        content.style.opacity = '0';

        const onCloseEnd = (evt) => {
          if (evt.propertyName !== 'height') return;
          content.removeEventListener('transitionend', onCloseEnd);
          detail.open = false;
          detail.classList.remove('is-collapsing');
          content.style.transition = '';
          isAnimating = false;
        };
        content.addEventListener('transitionend', onCloseEnd);
        return;
      }

      detail.open = true;
      const targetHeight = content.scrollHeight;
      content.style.height = '0px';
      content.style.opacity = '0';
      content.offsetHeight;
      content.style.transition = 'height 0.25s ease, opacity 0.2s ease';
      content.style.height = `${targetHeight}px`;
      content.style.opacity = '1';

      const onOpenEnd = (evt) => {
        if (evt.propertyName !== 'height') return;
        content.removeEventListener('transitionend', onOpenEnd);
        content.style.height = 'auto';
        content.style.transition = '';
        isAnimating = false;
      };
      content.addEventListener('transitionend', onOpenEnd);
    });
  });
}

// 智能下载按钮
function setupSmartDownload() {
  const downloadArea = document.getElementById('hero-download-area');
  const macBrewTip = document.getElementById('hero-mac-brew-tip');
  const mobileTip = document.getElementById('hero-mobile-tip');
  const mainlandTip = document.getElementById('hero-mainland-tip');
  const mainlandLink = document.getElementById('hero-mainland-link');

  if (isMobile()) {
    mobileTip.classList.remove('hidden');
    mainlandTip.classList.add('hidden');
    return;
  }

  downloadArea.classList.remove('hidden');
  downloadArea.classList.add('flex');
  mainlandTip.classList.remove('hidden');

  const os = detectOS();
  const heroBtn = document.getElementById('hero-download-btn');
  const svgIcon = heroBtn.querySelector('svg').outerHTML;
  heroBtn.removeAttribute('target');
  heroBtn.removeAttribute('rel');
  mainlandLink.removeAttribute('target');
  mainlandLink.removeAttribute('rel');

  if (os === 'mac') {
    heroBtn.href = buildGithubLatestDownloadUrl(`Youran.Toolbox_${appVersion}_aarch64.dmg`);
    mainlandLink.href = buildOssDownloadUrl(`Youran Toolbox_${appVersion}_aarch64.dmg`);
    heroBtn.innerHTML = `${svgIcon} ${t('downloadMac')}`;
    macBrewTip.classList.remove('hidden');
  } else if (os === 'windows') {
    heroBtn.href = buildGithubLatestDownloadUrl(`Youran.Toolbox_${appVersion}_x64-setup.exe`);
    mainlandLink.href = buildOssDownloadUrl(`Youran Toolbox_${appVersion}_x64-setup.exe`);
    heroBtn.innerHTML = `${svgIcon} ${t('downloadWindows')}`;
    macBrewTip.classList.add('hidden');
  } else {
    heroBtn.href = 'https://github.com/dufu1991/youran-toolbox/releases/latest';
    heroBtn.setAttribute('target', '_blank');
    heroBtn.setAttribute('rel', 'noopener noreferrer');
    mainlandLink.href = buildOssDownloadUrl(`Youran Toolbox_${appVersion}_aarch64.dmg`);
    mainlandLink.setAttribute('target', '_blank');
    mainlandLink.setAttribute('rel', 'noopener noreferrer');
    heroBtn.innerHTML = `${svgIcon} ${t('downloadGithub')}`;
    macBrewTip.classList.add('hidden');
  }
}

// 加载全部下载列表
async function loadDownloads() {
  const container = document.getElementById('downloads-content');
  const macIcon = '<span class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/8"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" style="color: var(--color-fg)"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></span>';
  const winIcon = '<span class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/8"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" style="color: var(--color-fg)"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg></span>';
  const downloadIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-download-icon lucide-cloud-download"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></svg>';

  const renderAssetCard = ({ href, title, meta, osIcon }) => `
    <a href="${href}" target="_blank" rel="noopener noreferrer" class="group flex items-center justify-between gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/70 hover:bg-indigo-500/8 hover:shadow-[0_8px_24px_rgba(99,102,241,0.18)]" style="border-color: var(--color-border);">
      <div class="min-w-0">
        <div class="mb-1 flex items-center gap-3">
          ${osIcon}
          <span class="text-xl font-bold">${title}</span>
        </div>
        <div class="text-xs" style="color: var(--color-muted)">${meta}</div>
      </div>
      <span class="shrink-0 rounded-lg border p-2 text-indigo-300 transition-colors group-hover:text-indigo-200" style="border-color: color-mix(in srgb, var(--color-border) 75%, transparent);">
        ${downloadIcon}
      </span>
    </a>
  `;

  const formatAssetSize = (sizeInBytes) => `${(sizeInBytes / 1024 / 1024).toFixed(1)} ${t('downloadSizeUnitMb')}`;

  const getAssetLabel = (asset) => {
    if (asset.name.endsWith('.dmg')) return `${t('downloadMacShort')} · ${formatAssetSize(asset.size)}`;
    if (asset.name.endsWith('.msi')) return `${t('downloadWindowsMsiShort')} · ${formatAssetSize(asset.size)}`;
    return `${t('downloadWindowsShort')} · ${formatAssetSize(asset.size)}`;
  };

  const renderHistoryLink = (href, label, source) => `
    <a href="${href}" target="_blank" rel="noopener noreferrer" class="group inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/70 hover:bg-indigo-500/8 hover:text-indigo-200" style="border-color: var(--color-border); color: var(--color-muted);">
      <span>${source} · ${label}</span>
      <span class="shrink-0 text-indigo-300 group-hover:text-indigo-200">${downloadIcon}</span>
    </a>
  `;

  try {
    const res = await fetch('https://api.github.com/repos/dufu1991/youran-toolbox/releases?per_page=10');
    const releases = await res.json();

    if (!releases.length) {
      container.innerHTML = `<p class="text-center" style="color: var(--color-muted)">${t('noVersions')}</p>`;
      return;
    }

    const latestRelease = releases[0];
    const latestDate = new Date(latestRelease.published_at).toLocaleDateString(getDateLocale());
    const latestMacAssets = latestRelease.assets.filter(a => a.name.endsWith('.dmg'));
    const latestWinAssets = latestRelease.assets.filter(a => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
    const latestVersion = normalizeTagVersion(latestRelease.tag_name || latestRelease.name || appVersion);
    const showLatestAliyun = isVersionGte(latestVersion, '0.1.1');
    const latestGithubAssets = [
      ...latestMacAssets.map(a => renderAssetCard({
        href: a.browser_download_url,
        title: t('downloadMacShort'),
        meta: `${t('downloadArchAppleSilicon')} · ${formatAssetSize(a.size)}`,
        osIcon: macIcon,
      })),
      ...latestWinAssets.map(a => renderAssetCard({
        href: a.browser_download_url,
        title: t('downloadWindowsShort'),
        meta: `${t('downloadArchX64')} · ${formatAssetSize(a.size)}`,
        osIcon: winIcon,
      })),
    ].join('');
    const latestOssAssets = [
      ...latestMacAssets.map(a => renderAssetCard({
        href: buildOssDownloadUrl(`Youran Toolbox_${latestVersion}_aarch64.dmg`),
        title: t('downloadMacShort'),
        meta: `${t('downloadArchAppleSilicon')} · ${formatAssetSize(a.size)}`,
        osIcon: macIcon,
      })),
      ...latestWinAssets.map(a => renderAssetCard({
        href: buildOssDownloadUrl(`Youran Toolbox_${latestVersion}_x64-setup.exe`),
        title: t('downloadWindowsShort'),
        meta: `${t('downloadArchX64')} · ${formatAssetSize(a.size)}`,
        osIcon: winIcon,
      })),
    ].join('');

    const olderReleases = releases.slice(1);
    const olderReleasesHtml = olderReleases.length ? `
      <details class="download-history rounded-2xl border overflow-hidden" style="background-color: var(--color-surface); border-color: var(--color-border);">
        <summary class="faq-summary flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-base font-semibold" style="color: var(--color-fg);">
          <span>${t('historyVersions')}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-muted)">${olderReleases.length} ${t('historySummary')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron lucide lucide-chevron-right-icon lucide-chevron-right shrink-0"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </summary>
        <div class="faq-content border-t" style="border-color: var(--color-border);">
          <div class="faq-content-inner px-6 py-2">
            ${olderReleases.map((release) => {
            const date = new Date(release.published_at).toLocaleDateString(getDateLocale());
            const releaseAssets = release.assets.filter(a => a.name.endsWith('.dmg') || a.name.endsWith('.exe') || a.name.endsWith('.msi'));
            const macAsset = releaseAssets.find(a => a.name.endsWith('.dmg'));
            const windowsAsset = releaseAssets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
            const version = normalizeTagVersion(release.tag_name || release.name || '');
            const showAliyunForVersion = isVersionGte(version, '0.1.1');
            const versionedOssLinks = [
              macAsset ? {
                href: buildVersionedOssDownloadUrl(version, `Youran Toolbox_${version}_aarch64.dmg`),
                label: `${t('downloadMacShort')} · ${formatAssetSize(macAsset.size)}`,
              } : null,
              windowsAsset ? {
                href: buildVersionedOssDownloadUrl(version, `Youran Toolbox_${version}_x64-setup.exe`),
                label: `${t('downloadWindowsShort')} · ${formatAssetSize(windowsAsset.size)}`,
              } : null,
            ].filter(Boolean);

            const historyLinks = [
              ...releaseAssets.map(a => ({ href: a.browser_download_url, label: getAssetLabel(a), source: t('historySourceGithub') })),
              ...(showAliyunForVersion ? versionedOssLinks.map(link => ({ ...link, source: t('historySourceAliyun') })) : []),
            ];

            return `<div class="border-b py-3 last:border-b-0" style="border-color: var(--color-border);">
              <div class="mb-2 flex items-center gap-2">
                <span class="text-sm font-semibold">${release.name || release.tag_name}</span>
                <span class="text-xs" style="color: var(--color-muted)">${date}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                ${historyLinks.length ? historyLinks.map(link => renderHistoryLink(link.href, link.label, link.source)).join('') : `<span class="text-xs" style="color: var(--color-muted)">${t('noPackages')}</span>`}
              </div>
            </div>`;
          }).join('')}
          </div>
        </div>
      </details>
    ` : '';

    container.innerHTML = `
      <div class="mb-6 rounded-2xl border overflow-hidden" style="background-color: var(--color-surface); border-color: var(--color-border);">
        <div class="flex items-center gap-3 px-6 py-4 border-b" style="border-color: var(--color-border);">
          <h3 class="text-lg font-bold">${latestRelease.name || latestRelease.tag_name}</h3>
          <span class="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">${t('latestVersion')}</span>
          <span class="ml-auto text-xs" style="color: var(--color-muted)">${latestDate}</span>
        </div>
        <div class="px-6 py-4">
          <div class="mb-4">
            <div class="mb-2 text-xs font-semibold" style="color: var(--color-muted)">${t('githubAddress')}</div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${latestGithubAssets || `<p class="text-sm" style="color: var(--color-muted)">${t('noPackages')}</p>`}
            </div>
          </div>
          <div>
            <div class="mb-2 text-xs font-semibold" style="color: var(--color-muted)">${t('aliyunAddress')}</div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${showLatestAliyun ? (latestOssAssets || `<p class="text-sm" style="color: var(--color-muted)">${t('noPackages')}</p>`) : `<p class="text-sm" style="color: var(--color-muted)">${t('aliyunFromVersion')}</p>`}
            </div>
          </div>
        </div>
      </div>
      ${olderReleasesHtml}
    `;
    setupFaqToggleAnimation();
  } catch {
    container.innerHTML = `<p class="text-center" style="color: var(--color-muted)">${t('loadFailed')}<a href="https://github.com/dufu1991/youran-toolbox/releases" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300">${t('goGithub')}</a></p>`;
  }
}

// 初始化
setupLanguageSwitcher();
applySiteLanguage();
renderFeatureCards();
renderFeatureDetails();
renderTechStack();
setupHoverEffects();
setupMobileMenu();
setupScrollNav();
setupRouter();
loadChangelog();
setupHeroBrewCopy();
setupFaqCommandCopy();
setupFaqToggleAnimation();
setupSmartDownload();
loadDownloads();
