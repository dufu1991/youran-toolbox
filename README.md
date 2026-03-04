<p align="center">
  <img src="https://youran-toolbox.du-fu.com/logo.png" alt="悠然工具箱 Logo" width="120" />
</p>

<h1 align="center">悠然工具箱</h1>

<p align="center">一款跨平台、本地离线、注重隐私的轻量级桌面工具集，专注于提升日常办公效率。</p>

<p align="center">
  <a href="https://youran-toolbox.du-fu.com">官网</a>
</p>

## ✨ 特性

- 🖥️ 跨平台：原生支持 macOS 和 Windows，安装包仅数 MB
- 📡 完全离线：所有功能本地运行，无需联网
- 🔒 隐私优先：不上传、不收集、不追踪
- 🎨 简洁直观：界面清晰，零学习成本
- 🌗 亮暗主题：亮色、暗色、跟随系统，16 种主题色
- 💎 体验至上：页面切换数据不丢失，窗口大小位置自动记忆

## 🧰 功能

- 📝 批量重命名
- 📂 分类归档
- 🖼️ 图片压缩
- 📄 PDF 工具
- 📱 二维码
- 🔍 文本对比
- 🗺️ 数据热力图
- 🚀 持续更新中…

## 🌍 多语言

简体中文 · 繁体中文 · English · 日本語 · 한국어 · Français · Deutsch · Español · Italiano · Русский

## 🛠️ 技术栈

[Svelte](https://svelte.dev) · [SvelteKit](https://svelte.dev/docs/kit) · [Tauri](https://tauri.app) · [Tailwind CSS](https://tailwindcss.com) · [TypeScript](https://www.typescriptlang.org) · [Rust](https://www.rust-lang.org)

## 📦 安装说明

### 方式一：通过 GitHub Release 安装

前往 [GitHub Releases](https://github.com/dufu1991/youran-toolbox/releases) 页面，下载对应系统的安装包后直接安装。

### 方式二：通过 Homebrew 安装（macOS）

```sh
brew install --cask dufu1991/tap/youran-toolbox
```

### macOS 常见问题

在 macOS 上，从网络下载的应用会被系统打上 `com.apple.quarantine` 隔离属性。若应用未使用 Apple Developer ID 签名或尚未完成 Apple 公证，Gatekeeper 可能会拦截并显示「已损坏」或「无法验证开发者」。

如果打开应用时提示「已损坏」或「无法验证开发者」，建议先执行（仅移除隔离属性）：

```sh
xattr -dr com.apple.quarantine "/Applications/youran-toolbox.app"
```

如果仍然无法打开，再执行（清空全部扩展属性）：

```sh
xattr -cr /Applications/youran-toolbox.app
```

或者将 `/Applications/youran-toolbox.app` 替换为实际的应用路径。

### Windows

直接运行安装程序即可。Windows 安装一般不会出现 macOS 的「已损坏」提示，但可能会遇到以下情况：

- `SmartScreen` 提示「Windows 已保护你的电脑」：点击「更多信息」，再点击「仍要运行」。
- 安装权限不足：建议右键安装程序，选择「以管理员身份运行」。
- 安全软件拦截或误报：将安装程序加入白名单后重试。
- 系统版本不符合：建议使用 `Windows 10（1803+）` 或 `Windows 11` 的 `x64` 系统。

## 💻 开发

```sh
bun install
bun run tauri dev
bun run tauri build
```

## 📄 许可证

MIT
