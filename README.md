# 悠然工具箱

一款轻量级的桌面工具箱应用，专注于提升日常办公效率。功能持续增加中...

## 功能特性

### Excel 分类归档

将 Excel 数据按指定列自动分类到不同的 Sheet 中。

- 支持拖拽或选择 Excel 文件（.xlsx、.xls 格式）
- 可选择任意列作为分类依据
- 支持多行表头（1-6 行可选）
- 自动保留原始数据在"全部" Sheet 中
- 保留原始表格的合并单元格和列宽设置
- 处理完成后显示分类统计信息

### 批量分类归档

批量处理多个 Excel 文件，统一分类归档。

- 支持同时选择多个 Excel 文件
- 统一设置模式：所有文件使用相同的分类列和表头行数
- 单独设置模式：每个文件独立配置
- 支持输出到文件夹或打包为 ZIP
- 可自定义文件名前缀和后缀

## 技术栈

- **前端框架**：Svelte 5 + SvelteKit
- **桌面框架**：Tauri 2
- **样式**：Tailwind CSS
- **Excel 处理**：xlsx
- **语言**：TypeScript + Rust

## 安装说明

### macOS

如果打开应用时提示"已损坏"或"无法验证开发者"，请在终端执行：

```sh
xattr -cr /Applications/youran-tools.app
```

或者将 `/Applications/youran-tools.app` 替换为实际的应用路径。

### Windows

直接运行安装程序即可。

## 开发

### 安装依赖

```sh
bun install
```

### 开发运行

```sh
bun run tauri dev
```

### 构建应用

```sh
bun run tauri build
```

## 许可证

MIT
