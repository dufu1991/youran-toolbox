# 娟娟工具箱

一款轻量级的桌面工具箱应用，专注于提升日常办公效率。

## 功能特性

### Excel 分类归档

将 Excel 数据按指定列自动分类到不同的 Sheet 中。

- 支持拖拽或选择 Excel 文件（.xlsx、.xls 格式）
- 可选择任意列作为分类依据
- 支持多行表头（1-6 行可选）
- 自动保留原始数据在"全部" Sheet 中
- 保留原始表格的合并单元格和列宽设置
- 处理完成后显示分类统计信息

## 技术栈

- **前端框架**：Svelte 5 + SvelteKit
- **桌面框架**：Tauri 2
- **样式**：Tailwind CSS
- **Excel 处理**：xlsx
- **语言**：TypeScript + Rust

## 安装依赖

```sh
bun install
```

## 开发运行

```sh
bun run tauri dev
```

## 构建应用

```sh
bun run tauri build
```

## 许可证

MIT
