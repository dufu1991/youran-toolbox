<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { toast } from '$lib/components/ui/toast';
	import { ChevronLeft, Download, Copy, Upload, QrCode, Dices, FolderOpen, ScanLine, Check, X, Clipboard } from 'lucide-svelte';
	import QRCode from 'qrcode';
	import jsQR from 'jsqr';
	import { save } from '@tauri-apps/plugin-dialog';
	import { writeFile } from '@tauri-apps/plugin-fs';
	import { revealItemInDir } from '@tauri-apps/plugin-opener';
	import { writeImage } from '@tauri-apps/plugin-clipboard-manager';

	// 检测操作系统，获取粘贴快捷键
	const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');
	const pasteShortcut = isMac ? '⌘V' : 'Ctrl+V';

	// 生成模式
	let inputText: string = $state('悠然工具箱');
	let qrDataUrl: string = $state('');
	let qrSize: number = $state(256);
	let errorLevel: 'L' | 'M' | 'Q' | 'H' = $state('M');
	let darkColor: string = $state('#000000');
	let lightColor: string = $state('#ffffff');
	let finderColor: string = $state(''); // 定位点颜色，空表示跟随配色方案
	let dotColor: string = $state(''); // 码点颜色，空表示跟随配色方案
	let margin: number = $state(2);
	let outputFormat: 'png' | 'jpeg' = $state('png');
	let dotStyle: string = $state('square'); // 码点形状
	let finderStyle: string = $state('square'); // 定位点样式

	// 定位点样式选项（只保留兼容性好的）
	const finderStyles = [
		{ value: 'square', label: 'finderStyle.square' },
		{ value: 'rounded', label: 'finderStyle.rounded' },
		{ value: 'roundedMedium', label: 'finderStyle.roundedMedium' },
		{ value: 'roundedThin', label: 'finderStyle.roundedThin' },
		{ value: 'circleThick', label: 'finderStyle.circleThick' },
	];

	// 码点样式选项（只保留兼容性好的）
	const dotStyles = [
		{ value: 'square', label: 'dotStyle.square' },
		{ value: 'rounded', label: 'dotStyle.rounded' },
		{ value: 'extraRounded', label: 'dotStyle.extraRounded' },
		{ value: 'classy', label: 'dotStyle.classy' },
	];

	// 识别模式
	let mode: 'generate' | 'scan' = $state('generate');
	let scanResult: string = $state('')
	let scanError: string = $state('');
	let scanImageUrl: string = $state(''); // 上传/粘贴的图片预览

	// 保存的文件路径
	let lastSavedPath: string = $state('');

	// Logo 设置
	let logoFile: File | null = $state(null);
	let logoDataUrl: string = $state('');
	let logoSize: number = $state(20); // 占二维码的百分比
	let logoRadius: number = $state(15); // 圆角百分比（相对于 logo 尺寸）
	let logoPadding: number = $state(4); // Logo 周围的白色边距
	let logoImage: HTMLImageElement | null = $state(null);

	// 测试识别
	let testResult: 'idle' | 'success' | 'failed' = $state('idle');
	let testResultText: string = $state('');

	// 预设颜色
	const presetColors = [
		{ dark: '#000000', light: '#ffffff', name: 'classic' },
		{ dark: '#1e40af', light: '#dbeafe', name: 'blue' },
		{ dark: '#166534', light: '#dcfce7', name: 'green' },
		{ dark: '#9333ea', light: '#f3e8ff', name: 'purple' },
		{ dark: '#dc2626', light: '#fee2e2', name: 'red' },
		{ dark: '#ea580c', light: '#ffedd5', name: 'orange' },
		{ dark: '#0891b2', light: '#cffafe', name: 'cyan' },
		{ dark: '#be185d', light: '#fce7f3', name: 'pink' },
		{ dark: '#854d0e', light: '#fef9c3', name: 'yellow' },
		{ dark: '#374151', light: '#f3f4f6', name: 'gray' },
		{ dark: '#1e3a5f', light: '#e0f2fe', name: 'navy' },
		{ dark: '#065f46', light: '#d1fae5', name: 'teal' },
		{ dark: '#7c3aed', light: '#ede9fe', name: 'violet' },
		{ dark: '#0369a1', light: '#e0f2fe', name: 'sky' },
		{ dark: '#b91c1c', light: '#fef2f2', name: 'rose' },
		{ dark: '#4f46e5', light: '#eef2ff', name: 'indigo' },
		{ dark: '#059669', light: '#ecfdf5', name: 'emerald' },
		{ dark: '#d97706', light: '#fffbeb', name: 'amber' },
		{ dark: '#0d9488', light: '#f0fdfa', name: 'mint' },
		{ dark: '#6366f1', light: '#eef2ff', name: 'iris' },
		{ dark: '#c026d3', light: '#fdf4ff', name: 'fuchsia' },
		{ dark: '#16a34a', light: '#f0fdf4', name: 'lime' },
		{ dark: '#2563eb', light: '#eff6ff', name: 'royal' },
		{ dark: '#92400e', light: '#fef3c7', name: 'bronze' },
	];

	// 颜色输入模式
	let darkColorInput: string = $state('#000000');
	let lightColorInput: string = $state('#ffffff');

	// 解析颜色输入（支持 hex 和 rgb）
	function parseColorInput(input: string): string | null {
		const trimmed = input.trim();
		// 支持 #RGB, #RRGGBB
		if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
			const hex = trimmed.startsWith('#') ? trimmed : '#' + trimmed;
			if (hex.length === 4) {
				// 扩展 #RGB 为 #RRGGBB
				return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
			}
			return hex;
		}
		// 支持 rgb(r, g, b) 或 r, g, b 或 r g b
		const rgbMatch = trimmed.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/i);
		if (rgbMatch) {
			const r = Math.min(255, parseInt(rgbMatch[1]));
			const g = Math.min(255, parseInt(rgbMatch[2]));
			const b = Math.min(255, parseInt(rgbMatch[3]));
			return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
		}
		return null;
	}

	function applyDarkColor() {
		const parsed = parseColorInput(darkColorInput);
		if (parsed) {
			darkColor = parsed;
			darkColorInput = parsed;
			generateQR();
		}
	}

	function applyLightColor() {
		const parsed = parseColorInput(lightColorInput);
		if (parsed) {
			lightColor = parsed;
			lightColorInput = parsed;
			generateQR();
		}
	}

	// 同步颜色选择器和输入框
	function onDarkColorPick() {
		darkColorInput = darkColor;
		generateQR();
	}

	function onLightColorPick() {
		lightColorInput = lightColor;
		generateQR();
	}

	// Logo 相关函数
	async function handleLogoSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		logoFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			logoDataUrl = e.target?.result as string;
			// 预加载图片
			const img = new Image();
			img.onload = () => {
				logoImage = img;
				generateQR();
			};
			img.src = logoDataUrl;
		};
		reader.readAsDataURL(file);
		input.value = '';
	}

	function removeLogo() {
		logoFile = null;
		logoDataUrl = '';
		logoImage = null;
		generateQR();
	}

	// 绘制圆角矩形
	function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
		const r = Math.min(radius, width / 2, height / 2);
		if (r === 0) {
			ctx.fillRect(x, y, width, height);
			return;
		}
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + width - r, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + r);
		ctx.lineTo(x + width, y + height - r);
		ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
		ctx.lineTo(x + r, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
		ctx.fill();
	}

	// 绘制圆形
	function drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.fill();
	}

	// 绘制菱形
	function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
		const half = size / 2;
		ctx.beginPath();
		ctx.moveTo(cx, cy - half);
		ctx.lineTo(cx + half, cy);
		ctx.lineTo(cx, cy + half);
		ctx.lineTo(cx - half, cy);
		ctx.closePath();
		ctx.fill();
	}

	// 绘制星形
	function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number = 5) {
		ctx.beginPath();
		for (let i = 0; i < points * 2; i++) {
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			const angle = (Math.PI / points) * i - Math.PI / 2;
			const x = cx + Math.cos(angle) * radius;
			const y = cy + Math.sin(angle) * radius;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.fill();
	}

	// 绘制单圆角矩形
	function drawSingleRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number, corner: 'tl' | 'tr' | 'bl' | 'br' = 'br') {
		ctx.beginPath();
		if (corner === 'tl') {
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + size, y);
			ctx.lineTo(x + size, y + size);
			ctx.lineTo(x, y + size);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
		} else if (corner === 'tr') {
			ctx.moveTo(x, y);
			ctx.lineTo(x + size - radius, y);
			ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
			ctx.lineTo(x + size, y + size);
			ctx.lineTo(x, y + size);
		} else if (corner === 'bl') {
			ctx.moveTo(x, y);
			ctx.lineTo(x + size, y);
			ctx.lineTo(x + size, y + size);
			ctx.lineTo(x + radius, y + size);
			ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
		} else {
			ctx.moveTo(x, y);
			ctx.lineTo(x + size, y);
			ctx.lineTo(x + size, y + size - radius);
			ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
			ctx.lineTo(x, y + size);
		}
		ctx.closePath();
		ctx.fill();
	}

	// 绘制定位点（根据样式）
	function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, style: string, color: string) {
		const size7 = cellSize * 7;
		const size3 = cellSize * 3;
		const center = size7 / 2;
		const cx = x + center;
		const cy = y + center;

		ctx.fillStyle = color;

		switch (style) {
			case 'square': // 方正
				// 外框
				ctx.fillRect(x, y, size7, size7);
				ctx.fillStyle = lightColor;
				ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
				ctx.fillStyle = color;
				ctx.fillRect(x + cellSize * 2, y + cellSize * 2, size3, size3);
				break;

			case 'rounded': // 圆角
				const r1 = size7 * 0.2;
				drawRoundedRect(ctx, x, y, size7, size7, r1);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize, y + cellSize, cellSize * 5, cellSize * 5, r1 * 0.7);
				ctx.fillStyle = color;
				drawRoundedRect(ctx, x + cellSize * 2, y + cellSize * 2, size3, size3, r1 * 0.4);
				break;

			case 'roundedThick': // 粗圆角
				const r2 = size7 * 0.3;
				drawRoundedRect(ctx, x, y, size7, size7, r2);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize * 1.5, y + cellSize * 1.5, cellSize * 4, cellSize * 4, r2 * 0.5);
				ctx.fillStyle = color;
				drawCircle(ctx, cx, cy, cellSize * 1.2);
				break;

			case 'roundedMedium': // 中圆角
				const r3 = size7 * 0.25;
				drawRoundedRect(ctx, x, y, size7, size7, r3);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize, y + cellSize, cellSize * 5, cellSize * 5, r3 * 0.6);
				ctx.fillStyle = color;
				ctx.fillRect(x + cellSize * 2, y + cellSize * 2, size3, size3);
				break;

			case 'roundedThin': // 细圆角
				const r4 = size7 * 0.15;
				drawRoundedRect(ctx, x, y, size7, size7, r4);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize * 0.8, y + cellSize * 0.8, cellSize * 5.4, cellSize * 5.4, r4 * 0.8);
				ctx.fillStyle = color;
				ctx.fillRect(x + cellSize * 2, y + cellSize * 2, size3, size3);
				break;

			case 'circleThick': // 粗圆形
				drawCircle(ctx, cx, cy, size7 / 2);
				ctx.fillStyle = lightColor;
				drawCircle(ctx, cx, cy, size7 / 2 - cellSize * 1.2);
				ctx.fillStyle = color;
				drawCircle(ctx, cx, cy, cellSize * 1.3);
				break;

			case 'circleThin': // 细圆形
				drawCircle(ctx, cx, cy, size7 / 2);
				ctx.fillStyle = lightColor;
				drawCircle(ctx, cx, cy, size7 / 2 - cellSize * 0.8);
				ctx.fillStyle = color;
				drawCircle(ctx, cx, cy, cellSize * 1.2);
				break;

			case 'diamond': // 菱形
				drawCircle(ctx, cx, cy, size7 / 2);
				ctx.fillStyle = lightColor;
				drawCircle(ctx, cx, cy, size7 / 2 - cellSize);
				ctx.fillStyle = color;
				drawDiamond(ctx, cx, cy, size3 * 1.2);
				break;

			case 'star': // 星形
				drawCircle(ctx, cx, cy, size7 / 2);
				ctx.fillStyle = lightColor;
				drawCircle(ctx, cx, cy, size7 / 2 - cellSize);
				ctx.fillStyle = color;
				drawStar(ctx, cx, cy, cellSize * 1.8, cellSize * 0.9, 5);
				break;

			case 'bubble': // 气泡
				const r5 = size7 * 0.5;
				drawRoundedRect(ctx, x, y, size7, size7, r5);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize, y + cellSize, cellSize * 5, cellSize * 5, r5 * 0.7);
				ctx.fillStyle = color;
				drawRoundedRect(ctx, x + cellSize * 2, y + cellSize * 2, size3, size3, size3 * 0.3);
				break;

			case 'eye': // 眼睛
				const r6 = size7 * 0.15;
				drawRoundedRect(ctx, x, y, size7, size7, r6);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize, y + cellSize, cellSize * 5, cellSize * 5, r6);
				ctx.fillStyle = color;
				drawRoundedRect(ctx, x + cellSize * 1.5, y + cellSize * 1.5, cellSize * 4, cellSize * 4, r6);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize * 2, y + cellSize * 2, size3, size3, r6 * 0.8);
				ctx.fillStyle = color;
				drawRoundedRect(ctx, x + cellSize * 2.5, y + cellSize * 2.5, cellSize * 2, cellSize * 2, r6 * 0.5);
				break;

			case 'cross': // 十字
				// 外框圆角矩形
				const r7 = size7 * 0.15;
				drawRoundedRect(ctx, x, y, size7, size7, r7);
				ctx.fillStyle = lightColor;
				drawRoundedRect(ctx, x + cellSize, y + cellSize, cellSize * 5, cellSize * 5, r7 * 0.6);
				ctx.fillStyle = color;
				// 中心十字形
				const crossWidth = cellSize * 1.2;
				const crossLength = size3;
				ctx.fillRect(cx - crossWidth / 2, cy - crossLength / 2, crossWidth, crossLength);
				ctx.fillRect(cx - crossLength / 2, cy - crossWidth / 2, crossLength, crossWidth);
				break;

			case 'codeEye': // 四码眼
				const r8 = size7 * 0.12;
				drawRoundedRect(ctx, x, y, size7, size7, r8);
				ctx.fillStyle = lightColor;
				ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
				ctx.fillStyle = color;
				// 四个小方块
				const smallSize = cellSize * 1.3;
				const gap = cellSize * 0.2;
				const innerStart = x + cellSize * 2 + gap;
				const innerStartY = y + cellSize * 2 + gap;
				ctx.fillRect(innerStart, innerStartY, smallSize, smallSize);
				ctx.fillRect(innerStart + smallSize + gap, innerStartY, smallSize, smallSize);
				ctx.fillRect(innerStart, innerStartY + smallSize + gap, smallSize, smallSize);
				ctx.fillRect(innerStart + smallSize + gap, innerStartY + smallSize + gap, smallSize, smallSize);
				break;

			default:
				// 默认方正
				ctx.fillRect(x, y, size7, size7);
				ctx.fillStyle = lightColor;
				ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
				ctx.fillStyle = color;
				ctx.fillRect(x + cellSize * 2, y + cellSize * 2, size3, size3);
		}
	}

	// 绘制单个码点（根据样式）
	function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, style: string) {
		const cx = x + cellSize / 2;
		const cy = y + cellSize / 2;
		const half = cellSize / 2;

		switch (style) {
			case 'square': // 方形
				ctx.fillRect(x, y, cellSize, cellSize);
				break;
			case 'rounded': // 圆角（30%）
				drawRoundedRect(ctx, x, y, cellSize, cellSize, cellSize * 0.3);
				break;
			case 'extraRounded': // 超圆角（50%，接近圆形但填满格子）
				drawRoundedRect(ctx, x, y, cellSize, cellSize, cellSize * 0.5);
				break;
			case 'classy': // 经典风格（左上和右下圆角）
				ctx.beginPath();
				ctx.moveTo(x + cellSize * 0.4, y);
				ctx.lineTo(x + cellSize, y);
				ctx.lineTo(x + cellSize, y + cellSize * 0.6);
				ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize * 0.6, y + cellSize);
				ctx.lineTo(x, y + cellSize);
				ctx.lineTo(x, y + cellSize * 0.4);
				ctx.quadraticCurveTo(x, y, x + cellSize * 0.4, y);
				ctx.closePath();
				ctx.fill();
				break;
			case 'diamond': // 菱形
				drawDiamond(ctx, cx, cy, cellSize * 0.9);
				break;
			case 'star': // 五角星
				drawStar(ctx, cx, cy, half * 0.9, half * 0.45, 5);
				break;
			case 'star4': // 四角星
				drawStar(ctx, cx, cy, half * 0.9, half * 0.35, 4);
				break;
			default:
				ctx.fillRect(x, y, cellSize, cellSize);
		}
	}

	// 判断是否在定位点区域内
	function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
		// 左上角定位点 (0-6, 0-6)
		if (row < 7 && col < 7) return true;
		// 右上角定位点 (0-6, moduleCount-7 到 moduleCount-1)
		if (row < 7 && col >= moduleCount - 7) return true;
		// 左下角定位点 (moduleCount-7 到 moduleCount-1, 0-6)
		if (row >= moduleCount - 7 && col < 7) return true;
		return false;
	}

	async function generateQR() {
		if (!inputText.trim()) {
			qrDataUrl = '';
			return;
		}

		// 重置测试结果
		testResult = 'idle';
		testResultText = '';

		// 获取二维码矩阵数据
		const qr = QRCode.create(inputText, { errorCorrectionLevel: errorLevel });
		const modules = qr.modules;
		const moduleCount = modules.size;

		// 使用更高的渲染比例来避免模糊（至少 2 倍）
		const scale = Math.max(2, Math.ceil(qrSize / 256));

		// 计算尺寸 - 确保高分辨率画布尺寸是输出尺寸的精确倍数
		const scaledSize = qrSize * scale;
		const cellSize = Math.floor(scaledSize / (moduleCount + margin * 2));
		const actualMargin = cellSize * margin;
		const canvasSize = cellSize * moduleCount + actualMargin * 2;

		// 创建 canvas（高分辨率）
		const canvas = document.createElement('canvas');
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		const ctx = canvas.getContext('2d')!;

		// 绘制背景
		ctx.fillStyle = lightColor;
		ctx.fillRect(0, 0, canvasSize, canvasSize);

		// 绘制定位点
		const finderColorValue = finderColor || darkColor;
		const currentFinderStyle = finderStyle;
		// 左上角
		drawFinderPattern(ctx, actualMargin, actualMargin, cellSize, currentFinderStyle, finderColorValue);
		// 右上角
		drawFinderPattern(ctx, actualMargin + (moduleCount - 7) * cellSize, actualMargin, cellSize, currentFinderStyle, finderColorValue);
		// 左下角
		drawFinderPattern(ctx, actualMargin, actualMargin + (moduleCount - 7) * cellSize, cellSize, currentFinderStyle, finderColorValue);

		// 绘制数据点（跳过定位点区域）
		ctx.fillStyle = dotColor || darkColor;
		for (let row = 0; row < moduleCount; row++) {
			for (let col = 0; col < moduleCount; col++) {
				if (modules.get(row, col)) {
					const isFinder = isFinderPattern(row, col, moduleCount);
					if (isFinder) continue; // 跳过定位点区域

					const x = actualMargin + col * cellSize;
					const y = actualMargin + row * cellSize;
					drawDot(ctx, x, y, cellSize, dotStyle);
				}
			}
		}

		// 创建目标尺寸的 canvas 并缩放
		const outputCanvas = document.createElement('canvas');
		outputCanvas.width = qrSize;
		outputCanvas.height = qrSize;
		const outputCtx = outputCanvas.getContext('2d')!;

		// 先填充背景色（对于 JPEG 格式很重要）
		outputCtx.fillStyle = lightColor;
		outputCtx.fillRect(0, 0, qrSize, qrSize);

		// 使用高质量缩放
		outputCtx.imageSmoothingEnabled = true;
		outputCtx.imageSmoothingQuality = 'high';
		outputCtx.drawImage(canvas, 0, 0, canvasSize, canvasSize, 0, 0, qrSize, qrSize);

		// 绘制 Logo（如果有）
		if (logoImage && logoDataUrl) {
			const logoSizePx = Math.floor(qrSize * logoSize / 100);
			const logoX = (qrSize - logoSizePx) / 2;
			const logoY = (qrSize - logoSizePx) / 2;

			// 绘制白色背景（带圆角）
			const bgSize = logoSizePx + logoPadding * 2;
			const bgX = logoX - logoPadding;
			const bgY = logoY - logoPadding;
			const actualLogoRadius = (logoSizePx * logoRadius) / 100; // 根据 logo 尺寸计算实际圆角
			const bgRadius = actualLogoRadius + logoPadding / 2;

			outputCtx.fillStyle = lightColor;
			outputCtx.beginPath();
			outputCtx.roundRect(bgX, bgY, bgSize, bgSize, bgRadius);
			outputCtx.fill();

			// 绘制 Logo（带圆角裁剪）
			outputCtx.save();
			outputCtx.beginPath();
			outputCtx.roundRect(logoX, logoY, logoSizePx, logoSizePx, actualLogoRadius);
			outputCtx.clip();

			// 居中裁剪绘制 Logo（避免拉伸变形）
			const imgW = logoImage.naturalWidth;
			const imgH = logoImage.naturalHeight;
			const cropSize = Math.min(imgW, imgH); // 取较短边作为裁剪尺寸
			const sx = (imgW - cropSize) / 2; // 源图片裁剪起点 X
			const sy = (imgH - cropSize) / 2; // 源图片裁剪起点 Y
			outputCtx.drawImage(logoImage, sx, sy, cropSize, cropSize, logoX, logoY, logoSizePx, logoSizePx);
			outputCtx.restore();
		}

		// 根据格式导出
		if (outputFormat === 'jpeg') {
			qrDataUrl = outputCanvas.toDataURL('image/jpeg', 0.95);
		} else {
			qrDataUrl = outputCanvas.toDataURL('image/png');
		}
	}

	$effect(() => {
		if (inputText) {
			generateQR();
		}
	});

	async function downloadQR() {
		if (!qrDataUrl) return;

		const ext = outputFormat === 'jpeg' ? 'jpg' : 'png';
		// 使用输入内容作为默认文件名，去除特殊字符，限制长度
		const defaultName = inputText.trim()
			.replace(/[\\/:*?"<>|]/g, '') // 移除文件名不允许的字符
			.substring(0, 50) || 'qrcode'; // 限制长度，默认 qrcode

		const filePath = await save({
			defaultPath: `${defaultName}.${ext}`,
			filters: [{
				name: 'Image',
				extensions: [ext]
			}]
		});

		if (!filePath) return;

		// 将 base64 转换为二进制数据
		const base64Data = qrDataUrl.split(',')[1];
		const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

		await writeFile(filePath, binaryData);
		lastSavedPath = filePath;
		toast.success($_('qrcode.downloadSuccess'));
	}

	async function openSavedFolder() {
		if (lastSavedPath) {
			await revealItemInDir(lastSavedPath);
		}
	}

	async function copyQR() {
		if (!qrDataUrl) return;
		try {
			// 直接从 data URL 创建 blob
			const response = await fetch(qrDataUrl);
			const originalBlob = await response.blob();

			// 转换为 RGBA 图像数据
			const bitmap = await createImageBitmap(originalBlob);
			const canvas = document.createElement('canvas');
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(bitmap, 0, 0);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// 使用 Tauri 剪贴板插件写入图片（需要 RGBA 数据、宽度、高度）
			await writeImage({
				rgba: Array.from(imageData.data),
				width: canvas.width,
				height: canvas.height
			});
			toast.success($_('qrcode.copySuccess'));
		} catch (e) {
			console.error('Copy failed:', e);
			toast.error($_('qrcode.copyFailed'));
		}
	}

	// 测试识别当前二维码
	async function testScan() {
		if (!qrDataUrl) return;

		testResult = 'idle';
		testResultText = '';

		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height);
			if (code) {
				testResult = 'success';
				testResultText = code.data;
			} else {
				testResult = 'failed';
				testResultText = '';
			}
		};
		img.src = qrDataUrl;
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			scanFromFile(file);
		}
	}

	async function scanFromFile(file: File) {
		scanError = '';
		scanResult = '';
		// 释放之前的预览 URL
		if (scanImageUrl) {
			URL.revokeObjectURL(scanImageUrl);
		}
		const img = new Image();
		const url = URL.createObjectURL(file);
		scanImageUrl = url; // 保存预览 URL
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height);
			if (code) {
				scanResult = code.data;
			} else {
				scanError = $_('qrcode.scanFailed');
			}
		};
		img.src = url;
	}

	// 处理粘贴图片
	async function handlePaste(event: ClipboardEvent) {
		const items = event.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					scanFromFile(file);
					break;
				}
			}
		}
	}

	function copyResult() {
		if (scanResult) {
			navigator.clipboard.writeText(scanResult);
			toast.success($_('qrcode.copyResultSuccess'));
		}
	}

	// 随机配色
	function randomColor() {
		const randomIndex = Math.floor(Math.random() * presetColors.length);
		const preset = presetColors[randomIndex];
		darkColor = preset.dark;
		lightColor = preset.light;
		darkColorInput = preset.dark;
		lightColorInput = preset.light;
		dotColor = '';
		finderColor = '';
		generateQR();
	}

	// 随机样式
	function randomStyle() {
		const randomDotIndex = Math.floor(Math.random() * dotStyles.length);
		const randomFinderIndex = Math.floor(Math.random() * finderStyles.length);
		dotStyle = dotStyles[randomDotIndex].value;
		finderStyle = finderStyles[randomFinderIndex].value;
		generateQR();
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
	<div class="container mx-auto px-6 py-8">
		<header class="mb-8">
			<a href="/" class="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
				<ChevronLeft class="w-4 h-4" />
				{$_('nav.backHome')}
			</a>
			<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{$_('features.qrcode.title')}</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">{$_('features.qrcode.desc')}</p>
		</header>

		<!-- 模式切换 -->
		<div class="flex gap-2 mb-6">
			<Button variant={mode === 'generate' ? 'default' : 'outline'} onclick={() => mode = 'generate'}>
				<QrCode class="w-4 h-4 mr-2" />
				{$_('qrcode.generate')}
			</Button>
			<Button variant={mode === 'scan' ? 'default' : 'outline'} onclick={() => mode = 'scan'}>
				<Upload class="w-4 h-4 mr-2" />
				{$_('qrcode.scan')}
			</Button>
		</div>

		{#if mode === 'generate'}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- 输入区域 -->
				<Card.Root class="lg:col-span-2">
					<Card.Header>
						<Card.Title class="text-base">{$_('qrcode.inputContent')}</Card.Title>
					</Card.Header>
					<Card.Content>
						<textarea
							class="w-full h-24 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
							placeholder={$_('qrcode.inputPlaceholder')}
							bind:value={inputText}
						></textarea>
						<div class="flex flex-wrap gap-4 mt-4">
							<div class="flex items-center gap-2">
								<span class="text-sm text-slate-500">{$_('qrcode.size')}</span>
								<div class="flex">
									{#each [128, 256, 512, 1024] as size, i}
										<button
											class="px-2 py-1 text-xs border transition-all {qrSize === size ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 3 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
											onclick={() => { qrSize = size; generateQR(); }}
										>{size}px</button>
									{/each}
								</div>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-sm text-slate-500">{$_('qrcode.errorLevel')} <HintIcon text={$_('qrcode.errorLevelHint')} /></span>
								<div class="flex">
									{#each ['L', 'M', 'Q', 'H'] as level, i}
										<button
											class="px-2 py-1 text-xs border transition-all {errorLevel === level ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 3 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
											onclick={() => { errorLevel = level as 'L' | 'M' | 'Q' | 'H'; generateQR(); }}
										>{level}</button>
									{/each}
								</div>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-sm text-slate-500">{$_('qrcode.outputFormat')}</span>
								<div class="flex">
									{#each [{value: 'png', label: 'PNG'}, {value: 'jpeg', label: 'JPG'}] as format, i}
										<button
											class="px-2 py-1 text-xs border transition-all {outputFormat === format.value ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 1 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
											onclick={() => { outputFormat = format.value as 'png' | 'jpeg'; generateQR(); }}
										>{format.label}</button>
									{/each}
								</div>
							</div>
						</div>

						<!-- 颜色设置 -->
						<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div class="flex items-center gap-2 mb-3">
								<p class="text-sm text-slate-500">{$_('qrcode.colorScheme')}</p>
								<button
									class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
									onclick={randomColor}
									title={$_('qrcode.randomColor')}
								>
									<Dices class="w-4 h-4" />
								</button>
							</div>
							<div class="flex flex-wrap gap-2 mb-3">
								{#each presetColors as preset}
									<button
										class="w-7 h-7 rounded-md border-2 transition-all {darkColor === preset.dark && lightColor === preset.light ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										style="background: linear-gradient(135deg, {preset.dark} 50%, {preset.light} 50%)"
										onclick={() => { darkColor = preset.dark; lightColor = preset.light; darkColorInput = preset.dark; lightColorInput = preset.light; dotColor = ''; finderColor = ''; generateQR(); }}
										title={$_(`qrcode.color.${preset.name}`)}
									></button>
								{/each}
							</div>
							<div class="flex flex-wrap gap-4">
								<div class="flex items-center gap-2">
									<span class="text-xs text-slate-500">{$_('qrcode.darkColor')}</span>
									<input
										type="color"
										bind:value={darkColor}
										onchange={onDarkColorPick}
										class="w-7 h-7 cursor-pointer border border-slate-200 dark:border-slate-600 p-0 rounded-sm appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-sm"
									/>
									<input
										type="text"
										bind:value={darkColorInput}
										onblur={applyDarkColor}
										onkeydown={(e) => e.key === 'Enter' && applyDarkColor()}
										placeholder="#000000"
										class="w-24 px-2 py-1 text-xs rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
									/>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-xs text-slate-500">{$_('qrcode.lightColor')}</span>
									<input
										type="color"
										bind:value={lightColor}
										onchange={onLightColorPick}
										class="w-7 h-7 cursor-pointer border border-slate-200 dark:border-slate-600 p-0 rounded-sm appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-sm"
									/>
									<input
										type="text"
										bind:value={lightColorInput}
										onblur={applyLightColor}
										onkeydown={(e) => e.key === 'Enter' && applyLightColor()}
										placeholder="#ffffff"
										class="w-24 px-2 py-1 text-xs rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
									/>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-xs text-slate-500">{$_('qrcode.margin')}</span>
									<div class="flex">
										{#each [0, 1, 2, 3, 4] as m, i}
											<button
												class="w-6 h-6 text-xs border transition-all {margin === m ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'} {i === 0 ? 'rounded-l-sm' : ''} {i === 4 ? 'rounded-r-sm' : ''} {i > 0 ? '-ml-px' : ''}"
												onclick={() => { margin = m; generateQR(); }}
											>{m}</button>
										{/each}
									</div>
								</div>
							</div>
							<p class="text-xs text-slate-400 mt-2">{$_('qrcode.colorInputHint')}</p>
						</div>

						<!-- 样式设置 -->
						<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div class="flex items-center gap-2 mb-3">
								<p class="text-sm text-slate-500">{$_('qrcode.styleSettings')}</p>
								<button
									class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
									onclick={randomStyle}
									title={$_('qrcode.randomStyle')}
								>
									<Dices class="w-4 h-4" />
								</button>
							</div>

							<!-- 码点形状 -->
							<div class="mb-4">
								<p class="text-xs text-slate-500 mb-2">{$_('qrcode.dotStyle')}</p>
								<div class="flex flex-wrap gap-1">
									{#each dotStyles as style}
										<button
											class="flex flex-col items-center p-1 rounded-lg border-2 transition-all {dotStyle === style.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
											onclick={() => { dotStyle = style.value; generateQR(); }}
											title={$_(`qrcode.${style.label}`)}
										>
											<svg width="28" height="28" viewBox="0 0 24 24" class="text-slate-700 dark:text-slate-300">
												{#if style.value === 'square'}
													<rect x="4" y="4" width="16" height="16" fill="currentColor"/>
												{:else if style.value === 'rounded'}
													<rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor"/>
												{:else if style.value === 'extraRounded'}
													<rect x="4" y="4" width="16" height="16" rx="8" fill="currentColor"/>
												{:else if style.value === 'diamond'}
													<polygon points="12,4 20,12 12,20 4,12" fill="currentColor"/>
												{:else if style.value === 'star'}
													<polygon points="12,4 14,10 20,10 15,14 17,20 12,16 7,20 9,14 4,10 10,10" fill="currentColor"/>
												{:else if style.value === 'star4'}
													<polygon points="12,4 14,10 20,12 14,14 12,20 10,14 4,12 10,10" fill="currentColor"/>
												{:else if style.value === 'classy'}
													<path d="M10,4 L20,4 L20,14 Q20,20 14,20 L4,20 L4,10 Q4,4 10,4 Z" fill="currentColor"/>
												{/if}
											</svg>
										</button>
									{/each}
								</div>
							</div>
							<!-- 码点颜色 -->
							<div class="flex items-center gap-2 mb-4">
								<span class="text-xs text-slate-500">{$_('qrcode.dotColor')}</span>
								<input
									type="color"
									value={dotColor || darkColor}
									oninput={(e) => { dotColor = e.currentTarget.value; generateQR(); }}
									class="w-7 h-7 cursor-pointer border border-slate-200 dark:border-slate-600 p-0 rounded-sm appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-sm"
								/>
							</div>

							<!-- 定位点形状 -->
							<div class="mb-4">
								<p class="text-xs text-slate-500 mb-2">{$_('qrcode.finderStyle')}</p>
								<div class="flex flex-wrap gap-1">
									{#each finderStyles as style}
										<button
											class="flex flex-col items-center p-1 rounded-lg border-2 transition-all {finderStyle === style.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
											onclick={() => { finderStyle = style.value; generateQR(); }}
											title={$_(`qrcode.${style.label}`)}
										>
												<svg width="28" height="28" viewBox="0 0 36 36" class="text-slate-800 dark:text-slate-200">
													{#if style.value === 'square'}
														<!-- 方正 -->
														<rect x="2" y="2" width="32" height="32" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" fill="white"/>
														<rect x="12" y="12" width="12" height="12" fill="currentColor"/>
													{:else if style.value === 'rounded'}
														<!-- 圆角 -->
														<rect x="2" y="2" width="32" height="32" rx="8" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" rx="5" fill="white"/>
														<circle cx="18" cy="18" r="6" fill="currentColor"/>
													{:else if style.value === 'roundedThick'}
														<!-- 粗圆角 -->
														<rect x="2" y="2" width="32" height="32" rx="10" fill="currentColor"/>
														<rect x="9" y="9" width="18" height="18" rx="5" fill="white"/>
														<circle cx="18" cy="18" r="5" fill="currentColor"/>
													{:else if style.value === 'roundedMedium'}
														<!-- 中圆角 -->
														<rect x="2" y="2" width="32" height="32" rx="7" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" rx="4" fill="white"/>
														<rect x="12" y="12" width="12" height="12" fill="currentColor"/>
													{:else if style.value === 'roundedThin'}
														<!-- 细圆角 -->
														<rect x="2" y="2" width="32" height="32" fill="currentColor"/>
														<rect x="5" y="5" width="26" height="26" fill="white"/>
														<rect x="12" y="12" width="12" height="12" fill="currentColor"/>
													{:else if style.value === 'circleThick'}
														<!-- 粗圆形 -->
														<circle cx="18" cy="18" r="16" fill="currentColor"/>
														<circle cx="18" cy="18" r="10" fill="white"/>
														<circle cx="18" cy="18" r="5" fill="currentColor"/>
													{:else if style.value === 'circleThin'}
														<!-- 细圆形 -->
														<circle cx="18" cy="18" r="16" fill="currentColor"/>
														<circle cx="18" cy="18" r="12" fill="white"/>
														<circle cx="18" cy="18" r="4" fill="currentColor"/>
													{:else if style.value === 'diamond'}
														<!-- 菱形 -->
														<circle cx="18" cy="18" r="16" fill="currentColor"/>
														<circle cx="18" cy="18" r="10" fill="white"/>
														<polygon points="18,10 26,18 18,26 10,18" fill="currentColor"/>
													{:else if style.value === 'star'}
														<!-- 星形 -->
														<circle cx="18" cy="18" r="16" fill="currentColor"/>
														<circle cx="18" cy="18" r="10" fill="white"/>
														<polygon points="18,10 20,15 26,15 21,19 23,25 18,21 13,25 15,19 10,15 16,15" fill="currentColor"/>
													{:else if style.value === 'bubble'}
														<!-- 气泡 -->
														<rect x="2" y="2" width="32" height="32" rx="16" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" rx="11" fill="white"/>
														<rect x="12" y="12" width="12" height="12" rx="4" fill="currentColor"/>
													{:else if style.value === 'eye'}
														<!-- 眼睛 -->
														<rect x="2" y="2" width="32" height="32" rx="4" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" rx="3" fill="white"/>
														<rect x="10" y="10" width="16" height="16" rx="2" fill="currentColor"/>
														<rect x="13" y="13" width="10" height="10" rx="1" fill="white"/>
														<rect x="15" y="15" width="6" height="6" fill="currentColor"/>
													{:else if style.value === 'cross'}
														<!-- 十字 -->
														<rect x="2" y="2" width="32" height="32" rx="4" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" rx="3" fill="white"/>
														<rect x="16" y="11" width="4" height="14" fill="currentColor"/>
														<rect x="11" y="16" width="14" height="4" fill="currentColor"/>
													{:else if style.value === 'codeEye'}
														<!-- 四码眼 -->
														<rect x="2" y="2" width="32" height="32" rx="2" fill="currentColor"/>
														<rect x="7" y="7" width="22" height="22" fill="white"/>
														<rect x="10" y="10" width="6" height="6" fill="currentColor"/>
														<rect x="20" y="10" width="6" height="6" fill="currentColor"/>
														<rect x="10" y="20" width="6" height="6" fill="currentColor"/>
														<rect x="20" y="20" width="6" height="6" fill="currentColor"/>
													{/if}
												</svg>
											</button>
										{/each}
									</div>
							</div>
							<!-- 定位点颜色 -->
							<div class="flex items-center gap-2">
								<span class="text-xs text-slate-500">{$_('qrcode.finderColor')}</span>
								<input
									type="color"
									value={finderColor || darkColor}
									oninput={(e) => { finderColor = e.currentTarget.value; generateQR(); }}
									class="w-7 h-7 cursor-pointer border border-slate-200 dark:border-slate-600 p-0 rounded-sm appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-sm"
								/>
							</div>

							<!-- Logo 设置 -->
							<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
								<p class="text-sm text-slate-500 mb-3">{$_('qrcode.logoSettings')}</p>
								<div class="flex items-center gap-3 mb-3">
									{#if logoDataUrl}
										<div class="relative">
											<img
												src={logoDataUrl}
												alt="Logo"
												class="w-12 h-12 object-cover border rounded"
												style="border-radius: {logoRadius}%"
											/>
											<button
												class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
												onclick={removeLogo}
											>×</button>
										</div>
									{:else}
										<input
											type="file"
											accept="image/*"
											class="hidden"
											id="logo-input"
											onchange={handleLogoSelect}
										/>
										<Button variant="outline" size="sm" onclick={() => document.getElementById('logo-input')?.click()}>
											<Upload class="w-4 h-4 mr-1" />
											{$_('qrcode.selectLogo')}
										</Button>
									{/if}
								</div>
								{#if logoDataUrl}
									<div class="space-y-3">
										<div class="flex items-center gap-2">
											<span class="text-xs text-slate-500 w-16">{$_('qrcode.logoSize')}</span>
											<input
												type="range"
												min="10"
												max="40"
												step="1"
												bind:value={logoSize}
												onchange={generateQR}
												class="w-24"
											/>
											<span class="text-xs text-slate-600 dark:text-slate-400 w-10">{logoSize}%</span>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-xs text-slate-500 w-16">{$_('qrcode.logoRadius')}</span>
											<input
												type="range"
												min="0"
												max="50"
												step="1"
												bind:value={logoRadius}
												onchange={generateQR}
												class="w-24"
											/>
											<span class="text-xs text-slate-600 dark:text-slate-400 w-10">{logoRadius}%</span>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-xs text-slate-500 w-16">{$_('qrcode.logoPadding')}</span>
											<input
												type="range"
												min="0"
												max="20"
												step="1"
												bind:value={logoPadding}
												onchange={generateQR}
												class="w-24"
											/>
											<span class="text-xs text-slate-600 dark:text-slate-400 w-10">{logoPadding}px</span>
										</div>
										<p class="text-xs text-amber-600 dark:text-amber-400">
											{$_('qrcode.logoHint')}
										</p>
									</div>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- 预览区域 -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">{$_('qrcode.preview')}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col items-center">
						{#if qrDataUrl}
							<img src={qrDataUrl} alt="QR Code" class="border rounded-lg" />
							<div class="flex gap-2 mt-4">
								<Button variant="outline" size="sm" onclick={downloadQR}>
									<Download class="w-4 h-4 mr-1" />
									{$_('qrcode.download')}
								</Button>
								<Button variant="outline" size="sm" onclick={copyQR} title={$_('qrcode.copyHint')}>
									<Copy class="w-4 h-4 mr-1" />
									{$_('qrcode.copy')}
								</Button>
								{#if lastSavedPath}
									<Button variant="outline" size="sm" onclick={openSavedFolder}>
										<FolderOpen class="w-4 h-4 mr-1" />
										{$_('qrcode.openFolder')}
									</Button>
								{/if}
							</div>
							<!-- 测试识别 -->
							<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 w-full">
								<div class="flex items-center justify-center gap-3">
									<Button variant="outline" size="sm" onclick={testScan}>
										<ScanLine class="w-4 h-4 mr-1" />
										{$_('qrcode.testScan')}
									</Button>
									{#if testResult === 'success'}
										<span class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
											<Check class="w-4 h-4" />
											{$_('qrcode.testSuccess')}
										</span>
									{:else if testResult === 'failed'}
										<span class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
											<X class="w-4 h-4" />
											{$_('qrcode.testFailed')}
										</span>
									{/if}
								</div>
								{#if testResult === 'success' && testResultText}
									<div class="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-slate-700 dark:text-slate-300 break-all text-center">
										{testResultText}
									</div>
								{/if}
							</div>
						{:else}
							<div class="w-64 h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
								<p class="text-slate-400 dark:text-slate-500 text-sm">{$_('qrcode.emptyHint')}</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		{:else}
			<!-- 识别模式 -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">{$_('qrcode.scanTitle')}</Card.Title>
				</Card.Header>
				<Card.Content>
					<!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_tabindex -->
					<div
						class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center focus:border-blue-400 focus:outline-none"
						tabindex="0"
						onpaste={handlePaste}
					>
						{#if scanImageUrl}
							<img src={scanImageUrl} alt="QR Code" class="max-w-48 max-h-48 mx-auto mb-4 rounded-lg" />
						{:else}
							<Upload class="w-12 h-12 text-slate-400 mx-auto mb-4" />
						{/if}
						<p class="text-slate-600 dark:text-slate-300 mb-2">{$_('qrcode.uploadHint')}</p>
						<p class="text-xs text-slate-400 dark:text-slate-500 mb-4">
							<Clipboard class="w-3 h-3 inline-block mr-1" />{$_('qrcode.pasteHint', { values: { shortcut: pasteShortcut } })}
						</p>
						<input
							type="file"
							accept="image/*"
							class="hidden"
							id="qr-file-input"
							onchange={handleFileSelect}
						/>
						<Button variant="outline" onclick={() => document.getElementById('qr-file-input')?.click()}>
							{$_('qrcode.selectImage')}
						</Button>
					</div>

					{#if scanResult}
						<div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
							<p class="text-sm text-green-600 dark:text-green-400 mb-2">{$_('qrcode.scanSuccess')}</p>
							<p class="text-slate-700 dark:text-slate-300 break-all">{scanResult}</p>
							<Button variant="outline" size="sm" class="mt-3" onclick={copyResult}>
								<Copy class="w-4 h-4 mr-1" />
								{$_('qrcode.copyResult')}
							</Button>
						</div>
					{/if}

					{#if scanError}
						<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p class="text-sm text-red-600 dark:text-red-400">{scanError}</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>
