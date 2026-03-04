import './app.css';
import { marked } from 'marked';
import changelogMd from '../../CHANGELOG.md?raw';

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
      { title: '命名规则类型', items: ['序号：自定义起始值和位数（如 001、002、003）', '文本：插入任意自定义文本内容', '当前时间：支持年月日时分秒多种精度和分隔符格式', '创建时间：使用文件的创建时间属性', '修改时间：使用文件的修改时间属性', '文件大小：支持自动/B/KB/MB/GB/TB 单位，可选是否显示单位', '像素尺寸：支持宽x高、仅宽度、仅高度、宽高比四种模式，连接符可选 x/X/*（像素）或 -/_/.（比例）', '原名称：完整保留、查找替换、按位置截取三种模式', '连接符：15 种常用分隔符（-、_、.、(、)、[、] 等）', '随机字符串：可配置长度 1-32 位，支持数字、大小写字母组合'] },
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
  container.innerHTML = features.map(f => `
    <a href="#guide" data-page="guide" data-scroll-to="${f.id}-detail" class="feature-card nav-link group rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 block no-underline w-full md:w-[calc(50%-0.75rem)]"
      style="background-color: var(--color-surface); border-color: var(--color-border);" data-color="${f.color}">
      <div class="mb-2 flex items-center gap-3">
        <span style="color: ${f.color}">${f.icon}</span>
        <h3 class="text-lg font-bold" style="color: ${f.color}">${f.name}</h3>
      </div>
      <p class="text-sm leading-relaxed" style="color: var(--color-muted)">${f.description}</p>
      <ul class="mt-3 space-y-1">${f.highlights.slice(0, 3).map(h => `<li class="flex items-start gap-1.5 text-xs" style="color: var(--color-muted)"><span style="color: ${f.color}" class="mt-0.5 shrink-0">·</span>${h}</li>`).join('')}</ul>
    </a>
  `).join('');
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
        <span class="text-xs" style="color: var(--color-muted)">结果：</span>
        <code class="font-mono rounded px-2 py-0.5 text-xs font-bold" style="background-color: color-mix(in srgb, ${feature.color} 10%, transparent); color: ${feature.color};">${ex.result}</code>
      </div>
    </div>`;
  }
  if (ex.type === 'table') {
    const groups = [...new Set(ex.rows.map(r => r[1]))];
    return `<div class="mb-6 rounded-xl border overflow-hidden" style="border-color: var(--color-border);">
      <div class="px-4 py-2.5 text-xs font-bold" style="background-color: var(--color-surface); color: ${feature.color}">${ex.title}</div>
      <div class="px-4 py-2 text-xs font-bold" style="color: var(--color-muted)">原始 Excel 数据</div>
      <div class="overflow-x-auto px-4 pb-2"><table class="w-full text-xs">
        <thead><tr>${ex.headers.map(h => `<th class="border-b px-3 py-1.5 text-left font-semibold" style="border-color: var(--color-border); color: var(--color-fg)">${h}</th>`).join('')}</tr></thead>
        <tbody>${ex.rows.map(row => `<tr>${row.map((cell, ci) => `<td class="border-b px-3 py-1.5" style="border-color: var(--color-border); color: ${ci === 1 ? feature.color : 'var(--color-muted)'}; font-weight: ${ci === 1 ? '600' : '400'}">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <div class="border-t px-4 py-2 text-xs font-bold" style="border-color: var(--color-border); color: var(--color-muted)">按「${ex.headers[1]}」分类后</div>
      <div class="px-4 pb-3"><div class="flex flex-wrap gap-2">
        ${groups.map(g => `<span class="rounded-md px-2.5 py-1 text-xs" style="background-color: color-mix(in srgb, ${feature.color} 12%, transparent); color: ${feature.color}; border: 1px solid color-mix(in srgb, ${feature.color} 25%, transparent);">${g} → ${ex.rows.filter(r => r[1] === g).length} 条</span>`).join('')}
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
  const quickJump = features.map(f => `
    <a href="#guide/${f.id}-detail" data-page="guide" data-scroll-to="${f.id}-detail"
      class="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/40"
      style="border-color: var(--color-border); color: ${f.color}; background-color: color-mix(in srgb, ${f.color} 12%, transparent);">
      ${f.name}
    </a>
  `).join('');

  return `<div class="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
    <div class="rounded-xl border p-5" style="border-color: var(--color-border); background-color: var(--color-surface);">
      <h3 class="mb-3 text-base font-bold" style="color: var(--color-fg)">先看这里</h3>
      <ol class="space-y-2 text-sm" style="color: var(--color-muted)">
        <li><span class="mr-2 font-mono" style="color: var(--color-syn-blue)">1.</span>先看「使用流程」，按步骤做一遍。</li>
        <li><span class="mr-2 font-mono" style="color: var(--color-syn-blue)">2.</span>遇到细节问题，再展开「常用设置」。</li>
        <li><span class="mr-2 font-mono" style="color: var(--color-syn-blue)">3.</span>先用少量文件测试，再批量处理正式文件。</li>
      </ol>
    </div>
    <div class="rounded-xl border p-5" style="border-color: var(--color-border); background-color: var(--color-surface);">
      <h3 class="mb-3 text-base font-bold" style="color: var(--color-fg)">快速跳转</h3>
      <div class="flex flex-wrap gap-2">${quickJump}</div>
    </div>
  </div>`;
}

// 渲染功能详情
function renderFeatureDetails() {
  const container = document.getElementById('feature-details');
  const sections = features.map((f) => {
    const workflowHtml = f.workflow.map((step, si) =>
      `<li class="flex items-start gap-2 text-sm"><span class="font-mono shrink-0 font-bold" style="color: ${f.color}">${si + 1}.</span><span style="color: var(--color-muted)">${step}</span></li>`
    ).join('');

    const highlightsHtml = f.highlights.map(h =>
      `<li class="flex items-start gap-1.5 text-sm" style="color: var(--color-fg)"><span style="color: ${f.color}" class="mt-0.5 shrink-0">·</span>${h}</li>`
    ).join('');

    const detailsHtml = f.details.map(d => `
      <details class="rounded-lg border p-4" style="border-color: var(--color-border); background-color: color-mix(in srgb, var(--color-surface) 65%, var(--color-bg));">
        <summary class="cursor-pointer text-sm font-semibold" style="color: ${f.color}">${d.title}</summary>
        <ul class="mt-3 space-y-1.5">${d.items.map(item => `<li class="text-sm leading-relaxed" style="color: var(--color-fg)"><span style="color: ${f.color}" class="mr-1">·</span>${item}</li>`).join('')}</ul>
      </details>
    `).join('');

    const tips = (guideTips[f.id] || []).map(tip =>
      `<li class="flex items-start gap-1.5 text-sm" style="color: var(--color-muted)"><span style="color: ${f.color}" class="mt-0.5 shrink-0">·</span>${tip}</li>`
    ).join('');

    return `<article id="${f.id}-detail" class="scroll-mt-24 rounded-2xl border p-6 lg:p-7" style="border-color: var(--color-border); background-color: color-mix(in srgb, var(--color-surface) 70%, var(--color-bg));">
      <div class="mb-5 flex items-center gap-3">
        <span style="color: ${f.color}; display: inline-flex;">${f.icon.replace('width="24"', 'width="30"').replace('height="24"', 'height="30"')}</span>
        <h3 class="text-2xl font-bold" style="color: ${f.color}">${f.name}</h3>
      </div>
      <p class="mb-5 text-sm leading-relaxed" style="color: var(--color-muted)">${f.description}</p>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div class="mb-4 rounded-lg border p-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
            <h4 class="mb-2 text-sm font-bold" style="color: ${f.color}">核心能力</h4>
            <ul class="space-y-1.5">${highlightsHtml}</ul>
          </div>
          <div class="mb-4 rounded-lg border p-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
            <h4 class="mb-2 text-sm font-bold" style="color: ${f.color}">使用流程</h4>
            <ol class="space-y-1.5">${workflowHtml}</ol>
          </div>
          ${renderExample(f)}
          <div class="mb-4 space-y-3">
            <h4 class="text-sm font-bold" style="color: ${f.color}">常用设置（按需展开）</h4>
            ${detailsHtml}
          </div>
          <div class="rounded-lg border p-4" style="border-color: var(--color-border); background-color: var(--color-surface);">
            <h4 class="mb-2 text-sm font-bold" style="color: ${f.color}">使用建议</h4>
            <ul class="space-y-1.5">${tips}</ul>
          </div>
        </div>
        <div>${renderPreviewCard(f.snippet, f.color)}</div>
      </div>
    </article>`;
  }).join('');

  container.innerHTML = `${renderGuideIntro()}<div class="space-y-8">${sections}</div>`;
}

// 渲染技术栈
function renderTechStack() {
  const container = document.getElementById('tech-grid');
  container.innerHTML = techs.map(t => `
    <div class="tech-card flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-300 hover:-translate-y-1"
      style="background-color: var(--color-surface); border-color: var(--color-border);" data-color="${t.color}">
      <div style="color: ${t.color}"><img src="${t.icon}" alt="${t.name}" class="w-7 h-7" /></div>
      <div>
        <div class="text-sm font-bold" style="color: var(--color-fg)">${t.name}</div>
        <div class="mt-1 text-xs" style="color: var(--color-muted)">${t.description}</div>
      </div>
    </div>
  `).join('');
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

// 智能下载按钮
function setupSmartDownload() {
  const downloadArea = document.getElementById('hero-download-area');
  const mobileTip = document.getElementById('hero-mobile-tip');

  if (isMobile()) {
    mobileTip.classList.remove('hidden');
    return;
  }

  downloadArea.classList.remove('hidden');
  downloadArea.classList.add('flex');

  const os = detectOS();
  const heroBtn = document.getElementById('hero-download-btn');
  const svgIcon = heroBtn.querySelector('svg').outerHTML;

  if (os === 'mac') {
    heroBtn.innerHTML = svgIcon + ' 下载 macOS 版';
  } else if (os === 'windows') {
    heroBtn.innerHTML = svgIcon + ' 下载 Windows 版';
  } else {
    heroBtn.innerHTML = svgIcon + ' 前往 GitHub 下载';
  }
}

// 加载全部下载列表
async function loadDownloads() {
  const container = document.getElementById('downloads-content');
  try {
    const res = await fetch('https://api.github.com/repos/dufu1991/youran-toolbox/releases?per_page=10');
    const releases = await res.json();

    if (!releases.length) {
      container.innerHTML = '<p class="text-center" style="color: var(--color-muted)">暂无可用版本</p>';
      return;
    }

    container.innerHTML = releases.map((release, i) => {
      const macAssets = release.assets.filter(a => a.name.endsWith('.dmg'));
      const winAssets = release.assets.filter(a => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
      const date = new Date(release.published_at).toLocaleDateString('zh-CN');
      const isLatest = i === 0;

      return `<div class="mb-6 rounded-2xl border overflow-hidden" style="background-color: var(--color-surface); border-color: var(--color-border);">
        <div class="flex items-center gap-3 px-6 py-4 border-b" style="border-color: var(--color-border);">
          <h3 class="text-lg font-bold">${release.name || release.tag_name}</h3>
          ${isLatest ? '<span class="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">最新版本</span>' : ''}
          <span class="ml-auto text-xs" style="color: var(--color-muted)">${date}</span>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            ${macAssets.length ? macAssets.map(a => `
              <a href="${a.browser_download_url}" class="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-indigo-500/50" style="border-color: var(--color-border);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" style="color: var(--color-fg)"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div class="text-sm font-semibold">${a.name}</div>
                  <div class="text-xs" style="color: var(--color-muted)">macOS · Apple Silicon · ${(a.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </a>
            `).join('') : ''}
            ${winAssets.length ? winAssets.map(a => `
              <a href="${a.browser_download_url}" class="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-indigo-500/50" style="border-color: var(--color-border);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" style="color: var(--color-fg)"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
                <div>
                  <div class="text-sm font-semibold">${a.name}</div>
                  <div class="text-xs" style="color: var(--color-muted)">Windows · x64 · ${(a.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </a>
            `).join('') : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<p class="text-center" style="color: var(--color-muted)">加载失败，请<a href="https://github.com/dufu1991/youran-toolbox/releases" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300">前往 GitHub</a> 查看</p>';
  }
}

// 初始化
renderFeatureCards();
renderFeatureDetails();
renderTechStack();
setupHoverEffects();
setupMobileMenu();
setupScrollNav();
setupRouter();
loadChangelog();
setupSmartDownload();
loadDownloads();
