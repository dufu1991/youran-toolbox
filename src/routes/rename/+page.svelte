<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { open } from '@tauri-apps/plugin-dialog';
	import { stat, rename, copyFile, mkdir } from '@tauri-apps/plugin-fs';
	import { revealItemInDir } from '@tauri-apps/plugin-opener';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { toast } from '$lib/components/ui/toast';
	import { ChevronLeft, FolderUp, X, Plus, Trash2, ArrowRight, Eye, EyeOff, Copy, Pencil, FolderOpen, Play, Hash, Type, Calendar, HardDrive, FileText, Minus, Clock, FileClock, Shuffle } from 'lucide-svelte';

	interface FileItem {
		path: string;
		name: string;
		size: number;
		createdAt: number;
		modifiedAt: number;
	}

	type SortBy = 'name' | 'size' | 'created' | 'modified';
	type SortOrder = 'asc' | 'desc';
	type RuleType = 'index' | 'text' | 'date' | 'createdDate' | 'modifiedDate' | 'size' | 'name' | 'separator' | 'random';
	type DatePrecision = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'monthDay' | 'dayOnly' | 'time' | 'hourMinute' | 'hourOnly';
	type DateSeparator = 'dash' | 'underscore' | 'none' | 'chinese';
	type TimeSeparator = 'dot' | 'dash' | 'none';
	type DateTimeSeparator = 'underscore' | 'dash' | 'none';
	type SizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'auto';

	// 常用连接符
	const separatorOptions = ['-', '_', '.', "'", '(', ')', '[', ']', '{', '}', '+', ',', ';', '=', '@'] as const;

	type NameOperation = 'full' | 'replace' | 'slice';

	interface RenameRule {
		id: string;
		type: RuleType;
		value: string;
		datePrecision: DatePrecision;
		dateSeparator: DateSeparator;
		timeSeparator: TimeSeparator;
		dateTimeSeparator: DateTimeSeparator;
		indexStart: number;
		indexPadding: number;
		sizeUnit: SizeUnit;
		sizeShowUnit: boolean;
		// 原名称操作
		nameOperation: NameOperation;
		nameFind: string;
		nameReplace: string;
		nameSliceStart: number;
		nameSliceEnd: number;
		// 随机字符串
		randomLength: number;
		randomUseDigits: boolean;
		randomUseLower: boolean;
		randomUseUpper: boolean;
	}

	// 规则类型配置
	const ruleTypeConfig: Record<RuleType, { color: string; bgColor: string; borderColor: string; icon: typeof Hash }> = {
		index: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30', borderColor: 'border-blue-200 dark:border-blue-700', icon: Hash },
		text: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/30', borderColor: 'border-green-200 dark:border-green-700', icon: Type },
		date: { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-200 dark:border-purple-700', icon: Calendar },
		createdDate: { color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/30', borderColor: 'border-teal-200 dark:border-teal-700', icon: Clock },
		modifiedDate: { color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30', borderColor: 'border-amber-200 dark:border-amber-700', icon: FileClock },
		size: { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30', borderColor: 'border-orange-200 dark:border-orange-700', icon: HardDrive },
		name: { color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800/50', borderColor: 'border-slate-300 dark:border-slate-600', icon: FileText },
		separator: { color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/30', borderColor: 'border-cyan-200 dark:border-cyan-700', icon: Minus },
		random: { color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-50 dark:bg-pink-900/30', borderColor: 'border-pink-200 dark:border-pink-700', icon: Shuffle }
	};

	let files: FileItem[] = $state([]);
	let sortBy: SortBy = $state('modified');
	let sortOrder: SortOrder = $state('asc');
	let sortByNewName: boolean = $state(false); // 按名称排序时，是否使用新名称
	let rules: RenameRule[] = $state([
		{ id: crypto.randomUUID(), type: 'index', value: '', datePrecision: 'day', dateSeparator: 'dash', timeSeparator: 'dot', dateTimeSeparator: 'underscore', indexStart: 1, indexPadding: 2, sizeUnit: 'auto', sizeShowUnit: true, nameOperation: 'full', nameFind: '', nameReplace: '', nameSliceStart: 0, nameSliceEnd: 0, randomLength: 6, randomUseDigits: true, randomUseLower: true, randomUseUpper: false },
		{ id: crypto.randomUUID(), type: 'separator', value: '_', datePrecision: 'day', dateSeparator: 'dash', timeSeparator: 'dot', dateTimeSeparator: 'underscore', indexStart: 1, indexPadding: 2, sizeUnit: 'auto', sizeShowUnit: true, nameOperation: 'full', nameFind: '', nameReplace: '', nameSliceStart: 0, nameSliceEnd: 0, randomLength: 6, randomUseDigits: true, randomUseLower: true, randomUseUpper: false },
		{ id: crypto.randomUUID(), type: 'name', value: '', datePrecision: 'day', dateSeparator: 'dash', timeSeparator: 'dot', dateTimeSeparator: 'underscore', indexStart: 1, indexPadding: 2, sizeUnit: 'auto', sizeShowUnit: true, nameOperation: 'full', nameFind: '', nameReplace: '', nameSliceStart: 0, nameSliceEnd: 0, randomLength: 6, randomUseDigits: true, randomUseLower: true, randomUseUpper: false }
	]);

	// 自定义名称（用户手动编辑）
	let customNames: Map<string, string> = $state(new Map());
	let editingPath: string | null = $state(null);
	let editingValue: string = $state('');
	let editingExt: string = $state(''); // 存储当前编辑文件的扩展名

	// 文件列表列数
	let listColumns: number = $state(3);

	// 文件列表展开状态
	let listExpanded: boolean = $state(false);
	const LIST_COLLAPSED_ROWS = 4; // 折叠时显示的行数

	// 复制模式
	let copyMode: boolean = $state(true);
	let copyModeType: 'inplace' | 'archive' = $state('archive'); // 原地复制 | 归档复制
	let outputDir: string = $state('');
	let useSubfolder: boolean = $state(false);
	let subfolderName: string = $state('');

	// 处理状态
	let processing: boolean = $state(false);
	let processResult: { success: number; failed: number } | null = $state(null);

	// 规则编辑状态
	let editingRuleId: string | null = $state(null);
	let showNameFindWarning: boolean = $state(false);

	async function openFileDialog() {
		const selected = await open({
			multiple: true,
			directory: false
		});

		if (selected && selected.length > 0) {
			await addFiles(selected);
		}
	}

	async function addFiles(paths: string[]) {
		const items: FileItem[] = [];

		for (const path of paths) {
			const info = await stat(path);
			const name = path.split('/').pop() || path.split('\\').pop() || path;

			items.push({
				path,
				name,
				size: info.size,
				createdAt: info.birthtime ? new Date(info.birthtime).getTime() : 0,
				modifiedAt: info.mtime ? new Date(info.mtime).getTime() : 0
			});
		}

		files = [...files, ...items];

		// 设置默认输出目录为第一个文件所在目录
		if (!outputDir && paths.length > 0) {
			const firstPath = paths[0];
			const sep = firstPath.includes('/') ? '/' : '\\';
			outputDir = firstPath.substring(0, firstPath.lastIndexOf(sep));
		}
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	function addRule() {
		addRuleOfType('index');
	}

	function addRuleOfType(type: RuleType) {
		const newRule: RenameRule = {
			id: crypto.randomUUID(),
			type,
			value: type === 'separator' ? '_' : '',
			datePrecision: 'day',
			dateSeparator: 'dash',
			timeSeparator: 'dot',
			dateTimeSeparator: 'underscore',
			indexStart: 1,
			indexPadding: 2,
			sizeUnit: 'auto',
			sizeShowUnit: true,
			nameOperation: 'full',
			nameFind: '',
			nameReplace: '',
			nameSliceStart: 0,
			nameSliceEnd: 0,
			randomLength: 6,
			randomUseDigits: true,
			randomUseLower: true,
			randomUseUpper: false
		};

		// 如果不是连接符，自动在前面添加一个连接符
		if (type !== 'separator') {
			const separatorRule: RenameRule = {
				id: crypto.randomUUID(),
				type: 'separator',
				value: '_',
				datePrecision: 'day',
				dateSeparator: 'dash',
				timeSeparator: 'dot',
				dateTimeSeparator: 'underscore',
				indexStart: 1,
				indexPadding: 2,
				sizeUnit: 'auto',
				sizeShowUnit: true,
				nameOperation: 'full',
				nameFind: '',
				nameReplace: '',
				nameSliceStart: 0,
				nameSliceEnd: 0,
				randomLength: 6,
				randomUseDigits: true,
				randomUseLower: true,
				randomUseUpper: false
			};
			rules = [...rules, separatorRule, newRule];
		} else {
			rules = [...rules, newRule];
		}

		// 如果是文本类型，自动进入编辑模式
		if (type === 'text') {
			editingRuleId = newRule.id;
		}
	}

	function formatDateWithOptions(precision: DatePrecision, dateSeparator: DateSeparator, timeSeparator: TimeSeparator, dateTimeSeparator: DateTimeSeparator): string {
		const now = new Date();
		const y = now.getFullYear();
		const m = String(now.getMonth() + 1).padStart(2, '0');
		const d = String(now.getDate()).padStart(2, '0');
		const h = String(now.getHours()).padStart(2, '0');
		const min = String(now.getMinutes()).padStart(2, '0');
		const s = String(now.getSeconds()).padStart(2, '0');

		// 中文格式
		if (dateSeparator === 'chinese') {
			switch (precision) {
				case 'year':
					return `${y}年`;
				case 'month':
					return `${y}年${m}月`;
				case 'day':
					return `${y}年${m}月${d}日`;
				case 'hour':
					return `${y}年${m}月${d}日${h}时`;
				case 'minute':
					return `${y}年${m}月${d}日${h}时${min}分`;
				case 'second':
					return `${y}年${m}月${d}日${h}时${min}分${s}秒`;
				case 'monthDay':
					return `${m}月${d}日`;
				case 'dayOnly':
					return `${d}日`;
				case 'time':
					return `${h}时${min}分${s}秒`;
				case 'hourMinute':
					return `${h}时${min}分`;
				case 'hourOnly':
					return `${h}时`;
				default:
					return `${y}年${m}月${d}日`;
			}
		}

		const sep = dateSeparator === 'dash' ? '-' : dateSeparator === 'underscore' ? '_' : '';
		const tSep = timeSeparator === 'dot' ? '.' : timeSeparator === 'dash' ? '-' : '';
		const dtSep = dateTimeSeparator === 'underscore' ? '_' : dateTimeSeparator === 'dash' ? '-' : '';

		switch (precision) {
			case 'year':
				return `${y}`;
			case 'month':
				return `${y}${sep}${m}`;
			case 'day':
				return `${y}${sep}${m}${sep}${d}`;
			case 'hour':
				return `${y}${sep}${m}${sep}${d}${dtSep}${h}`;
			case 'minute':
				return `${y}${sep}${m}${sep}${d}${dtSep}${h}${tSep}${min}`;
			case 'second':
				return `${y}${sep}${m}${sep}${d}${dtSep}${h}${tSep}${min}${tSep}${s}`;
			case 'monthDay':
				return `${m}${sep}${d}`;
			case 'dayOnly':
				return `${d}`;
			case 'time':
				return `${h}${tSep}${min}${tSep}${s}`;
			case 'hourMinute':
				return `${h}${tSep}${min}`;
			case 'hourOnly':
				return `${h}`;
			default:
				return `${y}${sep}${m}${sep}${d}`;
		}
	}

	function formatTimestampWithOptions(timestamp: number, precision: DatePrecision, dateSeparator: DateSeparator, timeSeparator: TimeSeparator, dateTimeSeparator: DateTimeSeparator): string {
		const date = new Date(timestamp);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		const h = String(date.getHours()).padStart(2, '0');
		const min = String(date.getMinutes()).padStart(2, '0');
		const s = String(date.getSeconds()).padStart(2, '0');

		// 中文格式
		if (dateSeparator === 'chinese') {
			switch (precision) {
				case 'year':
					return `${y}年`;
				case 'month':
					return `${y}年${m}月`;
				case 'day':
					return `${y}年${m}月${d}日`;
				case 'hour':
					return `${y}年${m}月${d}日${h}时`;
				case 'minute':
					return `${y}年${m}月${d}日${h}时${min}分`;
				case 'second':
					return `${y}年${m}月${d}日${h}时${min}分${s}秒`;
				case 'monthDay':
					return `${m}月${d}日`;
				case 'dayOnly':
					return `${d}日`;
				case 'time':
					return `${h}时${min}分${s}秒`;
				case 'hourMinute':
					return `${h}时${min}分`;
				case 'hourOnly':
					return `${h}时`;
				default:
					return `${y}年${m}月${d}日`;
			}
		}

		const sep = dateSeparator === 'dash' ? '-' : dateSeparator === 'underscore' ? '_' : '';
		const tSep = timeSeparator === 'dot' ? '.' : timeSeparator === 'dash' ? '-' : '';
		const dtSep = dateTimeSeparator === 'underscore' ? '_' : dateTimeSeparator === 'dash' ? '-' : '';

		switch (precision) {
			case 'year':
				return `${y}`;
			case 'month':
				return `${y}${sep}${m}`;
			case 'day':
				return `${y}${sep}${m}${sep}${d}`;
			case 'hour':
				return `${y}${sep}${m}${sep}${d}${dtSep}${h}`;
			case 'minute':
				return `${y}${sep}${m}${sep}${d}${dtSep}${h}${tSep}${min}`;
			case 'second':
				return `${y}${sep}${m}${sep}${d}${dtSep}${h}${tSep}${min}${tSep}${s}`;
			case 'monthDay':
				return `${m}${sep}${d}`;
			case 'dayOnly':
				return `${d}`;
			case 'time':
				return `${h}${tSep}${min}${tSep}${s}`;
			case 'hourMinute':
				return `${h}${tSep}${min}`;
			case 'hourOnly':
				return `${h}`;
			default:
				return `${y}${sep}${m}${sep}${d}`;
		}
	}

	function applyNameOperation(name: string, rule: RenameRule): string {
		switch (rule.nameOperation) {
			case 'full':
				return name;
			case 'replace':
				if (rule.nameFind) {
					return name.replaceAll(rule.nameFind, rule.nameReplace);
				}
				return name;
			case 'slice':
				const start = rule.nameSliceStart || 0;
				const end = rule.nameSliceEnd || name.length;
				return name.slice(start, end);
			default:
				return name;
		}
	}

	function generateRandomString(length: number, useDigits: boolean, useLower: boolean, useUpper: boolean): string {
		let chars = '';
		if (useDigits) chars += '0123456789';
		if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
		if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		if (!chars) chars = '0123456789'; // 默认使用数字

		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	// 为每个文件缓存随机字符串，确保预览和实际重命名时使用相同的值
	// 缓存 key 包含配置参数，配置改变时自动使用新的缓存
	function getRandomForFile(filePath: string, rule: RenameRule): string {
		const cacheKey = `${filePath}-${rule.id}-${rule.randomLength}-${rule.randomUseDigits}-${rule.randomUseLower}-${rule.randomUseUpper}`;
		if (!randomCache.has(cacheKey)) {
			randomCache.set(cacheKey, generateRandomString(rule.randomLength, rule.randomUseDigits, rule.randomUseLower, rule.randomUseUpper));
		}
		return randomCache.get(cacheKey)!;
	}

	const randomCache = new Map<string, string>();

	function getRulePreview(rule: RenameRule, file?: FileItem): string {
		if (rule.type === 'index') {
			return '1'.padStart(rule.indexPadding, '0');
		}
		if (rule.type === 'text') {
			return rule.value || '...';
		}
		if (rule.type === 'date') {
			return formatDateWithOptions(rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
		}
		if (rule.type === 'createdDate') {
			if (file) {
				return formatTimestampWithOptions(file.createdAt, rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
			}
			return formatDateWithOptions(rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
		}
		if (rule.type === 'modifiedDate') {
			if (file) {
				return formatTimestampWithOptions(file.modifiedAt, rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
			}
			return formatDateWithOptions(rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
		}
		if (rule.type === 'size') {
			// 示例大小：1.5MB = 1572864 bytes
			return formatSizeWithUnit(1572864, rule.sizeUnit, rule.sizeShowUnit);
		}
		if (rule.type === 'name') {
			let baseName = file ? (file.name.includes('.') ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name) : '';
			if (!baseName) return ''; // 占位符，在模板中使用 i18n
			return applyNameOperation(baseName, rule);
		}
		if (rule.type === 'separator') {
			return rule.value || '_';
		}
		if (rule.type === 'random') {
			if (file) {
				return getRandomForFile(file.path, rule);
			}
			return generateRandomString(rule.randomLength, rule.randomUseDigits, rule.randomUseLower, rule.randomUseUpper);
		}
		return '';
	}

	function removeRule(id: string) {
		rules = rules.filter((r) => r.id !== id);
		if (editingRuleId === id) {
			editingRuleId = null;
		}
	}

	function toggleEditRule(id: string) {
		if (editingRuleId === id) {
			editingRuleId = null;
		} else {
			editingRuleId = id;
		}
	}

	// 拖拽排序 (Pointer Events)
	let draggedRuleId: string | null = $state(null);
	let draggedRuleIndex: number = $state(-1);
	let dropTargetIndex: number = $state(-1);
	let isDragging: boolean = $state(false);
	let pointerStartX: number = 0;
	let pointerStartY: number = 0;
	let lastPointerX: number = 0;
	let rafId: number | null = null;
	let pendingClickId: string | null = null;

	function handlePointerDown(e: PointerEvent, id: string) {
		// 只响应主按钮（左键）
		if (e.button !== 0) return;

		// 如果点击的是删除按钮，不处理
		if ((e.target as HTMLElement).closest('button')) return;

		// 阻止默认行为，防止拖动时选中文字
		e.preventDefault();

		// 记录起始位置，准备可能的拖动
		pointerStartX = e.clientX;
		pointerStartY = e.clientY;
		lastPointerX = e.clientX;
		pendingClickId = id;

		// 设置拖动相关状态（但还没开始拖动）
		draggedRuleId = id;
		draggedRuleIndex = rules.findIndex((r) => r.id === id);
		dropTargetIndex = draggedRuleIndex;
	}

	function handlePointerMove(e: PointerEvent) {
		// 如果没有按下，忽略
		if (!draggedRuleId) return;

		const x = e.clientX;
		const y = e.clientY;
		const dx = Math.abs(x - pointerStartX);
		const dy = Math.abs(y - pointerStartY);

		// 检查是否开始拖动（移动超过 5px）
		if (!isDragging && (dx > 5 || dy > 5)) {
			isDragging = true;
			pendingClickId = null; // 取消点击
			// 开始拖动时设置 pointer capture
			const target = e.currentTarget as HTMLElement;
			target.setPointerCapture(e.pointerId);
		}

		if (!isDragging) return;

		// 使用 requestAnimationFrame 节流
		if (rafId !== null) return;

		rafId = requestAnimationFrame(() => {
			rafId = null;
			const newIndex = calculateDropIndex(x, y);
			if (newIndex !== dropTargetIndex) {
				dropTargetIndex = newIndex;
			}
		});
	}

	function handlePointerUp(e: PointerEvent) {
		const target = e.currentTarget as HTMLElement;

		// 释放 pointer capture
		if (target.hasPointerCapture(e.pointerId)) {
			target.releasePointerCapture(e.pointerId);
		}

		// 取消未执行的 RAF
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		// 如果是拖动，执行排序
		if (isDragging && draggedRuleId && dropTargetIndex !== -1 && dropTargetIndex !== draggedRuleIndex && dropTargetIndex !== draggedRuleIndex + 1) {
			const draggedRule = rules[draggedRuleIndex];
			const newRules = [...rules];
			newRules.splice(draggedRuleIndex, 1);
			// 如果拖拽元素在目标位置之前，目标索引需要减 1
			const insertIndex = draggedRuleIndex < dropTargetIndex ? dropTargetIndex - 1 : dropTargetIndex;
			newRules.splice(insertIndex, 0, draggedRule);
			rules = newRules;
		}

		// 如果是点击（没有拖动），触发编辑
		const clickId = pendingClickId;

		// 重置状态
		draggedRuleId = null;
		draggedRuleIndex = -1;
		dropTargetIndex = -1;
		pendingClickId = null;

		// 延迟重置 isDragging 并处理点击
		const wasDragging = isDragging;
		setTimeout(() => {
			isDragging = false;
			if (!wasDragging && clickId) {
				toggleEditRule(clickId);
			}
		}, 0);
	}

	function handlePointerCancel(e: PointerEvent) {
		// 取消拖动
		const target = e.currentTarget as HTMLElement;
		if (target.hasPointerCapture(e.pointerId)) {
			target.releasePointerCapture(e.pointerId);
		}
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		draggedRuleId = null;
		draggedRuleIndex = -1;
		dropTargetIndex = -1;
		pendingClickId = null;
		isDragging = false;
	}

	function calculateDropIndex(x: number, y: number): number {
		// 获取所有规则元素
		const ruleEls = document.querySelectorAll<HTMLElement>('[data-rule-id]');
		let newDropIndex = draggedRuleIndex;

		// 收集所有非拖拽元素的位置信息
		const positions: { index: number; left: number; right: number; centerX: number; top: number; bottom: number }[] = [];

		ruleEls.forEach((el) => {
			const ruleId = el.dataset.ruleId;
			const ruleIndex = parseInt(el.dataset.ruleIndex || '-1', 10);
			if (ruleId === draggedRuleId || ruleIndex === -1) return;

			const rect = el.getBoundingClientRect();
			positions.push({
				index: ruleIndex,
				left: rect.left,
				right: rect.right,
				centerX: rect.left + rect.width / 2,
				top: rect.top,
				bottom: rect.bottom
			});
		});

		if (positions.length === 0) return draggedRuleIndex;

		// 检查是否在元素行的垂直范围内
		const firstPos = positions[0];
		const lastPos = positions[positions.length - 1];
		const inVerticalRange = y >= firstPos.top - 20 && y <= lastPos.bottom + 20;

		if (!inVerticalRange) return draggedRuleIndex;

		// 检查是否在最左边
		if (x < firstPos.centerX) {
			newDropIndex = firstPos.index;
		}
		// 检查是否在最右边
		else if (x > lastPos.centerX) {
			newDropIndex = lastPos.index + 1;
		}
		// 在中间位置
		else {
			for (let j = 0; j < positions.length; j++) {
				const pos = positions[j];
				if (x < pos.centerX) {
					newDropIndex = pos.index;
					break;
				}
				newDropIndex = pos.index + 1;
			}
		}

		return newDropIndex;
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes}B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
	}

	function formatSizeWithUnit(bytes: number, unit: SizeUnit, showUnit: boolean): string {
		let value: number;
		let unitStr: string;

		if (unit === 'auto') {
			if (bytes < 1024) {
				value = bytes;
				unitStr = 'B';
			} else if (bytes < 1024 * 1024) {
				value = bytes / 1024;
				unitStr = 'KB';
			} else if (bytes < 1024 * 1024 * 1024) {
				value = bytes / (1024 * 1024);
				unitStr = 'MB';
			} else if (bytes < 1024 * 1024 * 1024 * 1024) {
				value = bytes / (1024 * 1024 * 1024);
				unitStr = 'GB';
			} else {
				value = bytes / (1024 * 1024 * 1024 * 1024);
				unitStr = 'TB';
			}
		} else {
			unitStr = unit;
			switch (unit) {
				case 'B':
					value = bytes;
					break;
				case 'KB':
					value = bytes / 1024;
					break;
				case 'MB':
					value = bytes / (1024 * 1024);
					break;
				case 'GB':
					value = bytes / (1024 * 1024 * 1024);
					break;
				case 'TB':
					value = bytes / (1024 * 1024 * 1024 * 1024);
					break;
				default:
					value = bytes;
			}
		}

		// 格式化数值
		let formatted: string;
		if (unit === 'B' || (unit === 'auto' && unitStr === 'B')) {
			formatted = Math.round(value).toString();
		} else if (value >= 100) {
			formatted = Math.round(value).toString();
		} else if (value >= 10) {
			formatted = value.toFixed(1);
		} else {
			formatted = value.toFixed(2);
		}

		return showUnit ? `${formatted}${unitStr}` : formatted;
	}

	function generateRuleValue(rule: RenameRule, index: number, file: FileItem): string {
		if (rule.type === 'index') {
			return String(rule.indexStart + index).padStart(rule.indexPadding, '0');
		}
		if (rule.type === 'text') {
			return rule.value;
		}
		if (rule.type === 'date') {
			return formatDateWithOptions(rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
		}
		if (rule.type === 'createdDate') {
			return formatTimestampWithOptions(file.createdAt, rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
		}
		if (rule.type === 'modifiedDate') {
			return formatTimestampWithOptions(file.modifiedAt, rule.datePrecision, rule.dateSeparator, rule.timeSeparator, rule.dateTimeSeparator);
		}
		if (rule.type === 'size') {
			return formatSizeWithUnit(file.size, rule.sizeUnit, rule.sizeShowUnit);
		}
		if (rule.type === 'name') {
			const baseName = file.name.includes('.') ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name;
			return applyNameOperation(baseName, rule);
		}
		if (rule.type === 'separator') {
			return rule.value || '_';
		}
		if (rule.type === 'random') {
			return getRandomForFile(file.path, rule);
		}
		return '';
	}

	function generateNewName(file: FileItem, index: number): string {
		const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
		const generated = rules.map((rule) => generateRuleValue(rule, index, file)).join('');

		// 如果没有规则，返回原文件名
		if (rules.length === 0) {
			return file.name;
		}

		return generated + ext;
	}

	function startEdit(path: string, currentName: string) {
		editingPath = path;
		// 分离文件名和扩展名
		const lastDotIndex = currentName.lastIndexOf('.');
		if (lastDotIndex > 0) {
			editingValue = currentName.slice(0, lastDotIndex);
			editingExt = currentName.slice(lastDotIndex);
		} else {
			editingValue = currentName;
			editingExt = '';
		}
	}

	function saveEdit() {
		if (editingPath && editingValue.trim()) {
			// 保存时加上扩展名
			customNames.set(editingPath, editingValue.trim() + editingExt);
			customNames = new Map(customNames);
		}
		editingPath = null;
		editingValue = '';
		editingExt = '';
	}

	function cancelEdit() {
		editingPath = null;
		editingValue = '';
		editingExt = '';
	}

	async function selectOutputDir() {
		const selected = await open({
			directory: true,
			multiple: false
		});
		if (selected) {
			outputDir = selected as string;
		}
	}

	function reset() {
		files = [];
		rules = [];
		customNames = new Map();
		outputDir = '';
		processResult = null;
	}

	// 计算实际输出目录
	const actualOutputDir = $derived.by(() => {
		if (!copyMode) return '';
		if (copyModeType === 'inplace') return ''; // 原地复制不需要统一输出目录
		if (!outputDir) return outputDir;
		if (useSubfolder && subfolderName.trim()) {
			const sep = outputDir.includes('/') ? '/' : '\\';
			return `${outputDir}${sep}${subfolderName.trim()}`;
		}
		return outputDir;
	});

	async function executeRename() {
		if (previewFiles.length === 0) return;

		processing = true;
		processResult = null;
		let success = 0;
		let failed = 0;

		// 如果是归档模式且使用子文件夹，先创建目录
		if (copyMode && copyModeType === 'archive' && useSubfolder && subfolderName.trim()) {
			try {
				await mkdir(actualOutputDir, { recursive: true });
			} catch (e) {
				console.error('Failed to create subfolder:', e);
			}
		}

		for (const file of previewFiles) {
			const sep = file.path.includes('/') ? '/' : '\\';
			const dir = file.path.substring(0, file.path.lastIndexOf(sep));

			// 根据复制模式类型确定目标目录
			let targetDir: string;
			if (copyMode) {
				if (copyModeType === 'inplace') {
					// 原地复制：使用原文件所在目录
					targetDir = dir;
				} else {
					// 归档复制：使用统一输出目录
					targetDir = actualOutputDir;
				}
			} else {
				targetDir = dir;
			}
			const targetPath = `${targetDir}${sep}${file.newName}`;

			// 跳过名称没有变化的文件（非复制模式）
			if (!copyMode && file.name === file.newName) {
				success++;
				continue;
			}

			try {
				if (copyMode) {
					await copyFile(file.path, targetPath);
				} else {
					await rename(file.path, targetPath);
				}
				success++;
			} catch (e) {
				console.error(`Failed to ${copyMode ? 'copy' : 'rename'} ${file.path}:`, e);
				failed++;
			}
		}

		processing = false;
		processResult = { success, failed };

		// 显示结果提示
		if (success > 0) {
			toast.success($_('rename.resultSuccess', { values: { count: success } }));
		}
		if (failed > 0) {
			toast.error($_('rename.resultFailed', { values: { count: failed } }));
		}

		// 如果是重命名模式且全部成功，清空文件列表
		if (!copyMode && failed === 0) {
			files = [];
			customNames = new Map();
		}
	}

	async function openOutputFolder() {
		if (actualOutputDir) {
			await revealItemInDir(actualOutputDir);
		}
	}

	// 使用 $derived 计算排序后的文件列表
	const sortedFiles = $derived.by(() => {
		// 如果按新名称排序，需要先计算所有文件的新名称
		if (sortBy === 'name' && sortByNewName) {
			const filesWithNewNames = files.map((file, index) => ({
				...file,
				newName: customNames.get(file.path) || generateNewName(file, index)
			}));
			return filesWithNewNames.sort((a, b) => {
				const compare = a.newName.localeCompare(b.newName);
				return sortOrder === 'asc' ? compare : -compare;
			});
		}

		return [...files].sort((a, b) => {
			let compare = 0;
			if (sortBy === 'name') {
				compare = a.name.localeCompare(b.name);
			} else if (sortBy === 'size') {
				compare = a.size - b.size;
			} else if (sortBy === 'created') {
				compare = a.createdAt - b.createdAt;
			} else {
				compare = a.modifiedAt - b.modifiedAt;
			}
			return sortOrder === 'asc' ? compare : -compare;
		});
	});

	// 使用 $derived 计算预览名称
	const previewFiles = $derived.by(() => {
		// 如果已经按新名称排序，文件已经有 newName 属性
		if (sortBy === 'name' && sortByNewName) {
			return sortedFiles.map((file) => ({
				...file,
				newName: (file as FileItem & { newName?: string }).newName || customNames.get(file.path) || generateNewName(file, 0)
			}));
		}
		return sortedFiles.map((file, index) => {
			// 优先使用自定义名称
			const newName = customNames.get(file.path) || generateNewName(file, index);
			return { ...file, newName };
		});
	});
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
	<div class="container mx-auto px-6 py-8">
		<header class="mb-8">
			<a href="/" class="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
				<ChevronLeft class="w-4 h-4" />
				{$_('nav.backHome')}
			</a>
			<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{$_('features.rename.title')}</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">{$_('features.rename.desc')}</p>
		</header>

		{#if files.length === 0}
			<Card.Root>
				<Card.Content class="p-0">
					<div
						class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
						role="button"
						tabindex="0"
						onclick={openFileDialog}
						onkeydown={(e) => e.key === 'Enter' && openFileDialog()}
					>
						<FolderUp class="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
						<p class="text-slate-600 dark:text-slate-300 mb-4">{$_('rename.selectHint')}</p>
						<Button variant="outline">
							{$_('rename.selectFiles')}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- 重命名规则 -->
			<Card.Root class="mb-4">
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between flex-wrap gap-2">
						<Card.Title class="text-base">{$_('rename.rules')} <HintIcon text={$_('rename.rulesHint')} position="right" /></Card.Title>
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-xs text-slate-400 dark:text-slate-500 mr-1">{$_('rename.quickAdd')}:</span>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
								onclick={() => addRuleOfType('name')}
							>
								<FileText class="w-3 h-3" />
								{$_('rename.ruleName')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
								onclick={() => addRuleOfType('index')}
							>
								<Hash class="w-3 h-3" />
								{$_('rename.ruleIndex')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50"
								onclick={() => addRuleOfType('text')}
							>
								<Type class="w-3 h-3" />
								{$_('rename.ruleText')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50"
								onclick={() => addRuleOfType('date')}
							>
								<Calendar class="w-3 h-3" />
								{$_('rename.ruleDate')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/50"
								onclick={() => addRuleOfType('createdDate')}
							>
								<Clock class="w-3 h-3" />
								{$_('rename.ruleCreatedDate')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
								onclick={() => addRuleOfType('modifiedDate')}
							>
								<FileClock class="w-3 h-3" />
								{$_('rename.ruleModifiedDate')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50"
								onclick={() => addRuleOfType('size')}
							>
								<HardDrive class="w-3 h-3" />
								{$_('rename.ruleSize')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700 hover:bg-cyan-100 dark:hover:bg-cyan-900/50"
								onclick={() => addRuleOfType('separator')}
							>
								<Minus class="w-3 h-3" />
								{$_('rename.ruleSeparator')}
							</button>
							<button
								class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/50"
								onclick={() => addRuleOfType('random')}
							>
								<Shuffle class="w-3 h-3" />
								{$_('rename.ruleRandom')}
							</button>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					{#if rules.length === 0}
						<p class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">{$_('rename.noRules')}</p>
					{:else}
						<!-- 横向标签展示 -->
						<div class="flex flex-wrap items-stretch gap-0 min-h-[40px] relative">
							{#each rules as rule, i (rule.id)}
								{@const config = ruleTypeConfig[rule.type]}
								{@const IconComponent = config.icon}
								{@const showIcon = rule.type === 'text' && !rule.value}
								{@const isFirst = i === 0}
								{@const isLast = i === rules.length - 1}
								{@const isDraggedItem = draggedRuleId === rule.id}
								{@const showIndicatorBefore = isDragging && dropTargetIndex === i && draggedRuleIndex !== i && draggedRuleIndex !== i - 1}
								{@const showIndicatorAfterLast = isDragging && isLast && dropTargetIndex === rules.length && draggedRuleIndex !== rules.length - 1}
								<!-- 间隔元素（第一个规则前面不需要） -->
								{#if !isFirst}
									<div class="w-2 border border-slate-200 dark:border-slate-700 {showIndicatorBefore ? 'bg-blue-100 dark:bg-blue-900/50' : ''}"></div>
								{/if}
								<div
									class="group relative inline-flex items-center gap-1.5 px-3 py-2 border-y cursor-grab active:cursor-grabbing select-none touch-none {config.bgColor} {config.borderColor} {isFirst ? 'border-l rounded-l-md' : ''} {isLast ? 'border-r rounded-r-md' : ''} {editingRuleId === rule.id ? 'ring-2 ring-primary ring-inset z-10' : ''} {isDraggedItem ? 'opacity-30' : ''}"
									data-rule-id={rule.id}
									data-rule-index={i}
									onpointerdown={(e) => handlePointerDown(e, rule.id)}
									onpointermove={handlePointerMove}
									onpointerup={handlePointerUp}
									onpointercancel={handlePointerCancel}
									onkeydown={(e) => e.key === 'Enter' && toggleEditRule(rule.id)}
									role="button"
									tabindex="0"
								>
									{#if showIcon}
										<IconComponent class="w-3.5 h-3.5 {config.color} pointer-events-none" />
									{/if}
									<span class="text-sm font-medium {config.color} pointer-events-none">{getRulePreview(rule) || $_('rename.ruleName')}</span>
									{#if !isDraggedItem}
										<button
											class="absolute -top-2 -right-2 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/50 shadow-sm z-20"
											onclick={(e) => { e.stopPropagation(); removeRule(rule.id); }}
										>
											<X class="w-3 h-3 text-red-500" />
										</button>
									{/if}
									{#if showIndicatorAfterLast}
										<div class="absolute -right-0.5 top-0 bottom-0 w-1 bg-blue-500 rounded-full z-30"></div>
									{/if}
								</div>
							{/each}
						</div>

						<!-- 文件名预览 -->
						{#if previewFiles.length > 0}
							<div class="mt-3 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-md">
								<p class="text-xs text-slate-500 dark:text-slate-400 truncate">
									<span class="text-slate-400 dark:text-slate-500">{$_('rename.previewTitle')}:</span>
									<span class="ml-1 font-medium text-slate-700 dark:text-slate-300">{previewFiles[0].newName}</span>
								</p>
							</div>
						{/if}

						<!-- 编辑面板 -->
						{#if editingRuleId}
							{@const editingRule = rules.find(r => r.id === editingRuleId)}
							{#if editingRule}
								{@const config = ruleTypeConfig[editingRule.type]}
								<div class="mt-3 p-4 rounded-lg border {config.bgColor} {config.borderColor}">
									<div class="flex items-center justify-between mb-3">
										<span class="text-sm font-medium {config.color}">{$_('rename.editRule')}</span>
										<button
											class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
											onclick={() => editingRuleId = null}
										>
											{$_('rename.confirm')}
										</button>
									</div>
									{#if editingRule.type === 'index'}
										<div class="flex items-center gap-2">
											<span class="text-xs text-slate-500">{$_('rename.padding')}</span>
											<input
												type="number"
												class="w-20 px-2 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
												bind:value={editingRule.indexPadding}
												min="1"
												max="10"
											/>
										</div>
									{:else if editingRule.type === 'text'}
										<input
											type="text"
											class="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
											placeholder={$_('rename.textPlaceholder')}
											bind:value={editingRule.value}
										/>
									{:else if editingRule.type === 'date' || editingRule.type === 'createdDate' || editingRule.type === 'modifiedDate'}
										<div class="space-y-3">
											<div>
												<p class="text-xs text-slate-500 mb-2">{$_('rename.datePrecision')}</p>
												<div class="flex gap-2 flex-wrap">
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'year' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'year'}
													>{$_('rename.dateYear')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'month' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'month'}
													>{$_('rename.dateMonth')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'day' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'day'}
													>{$_('rename.dateDay')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'hour' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'hour'}
													>{$_('rename.dateHour')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'minute' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'minute'}
													>{$_('rename.dateMinute')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'second' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'second'}
													>{$_('rename.dateSecond')}</button>
													<span class="text-slate-300 dark:text-slate-600">|</span>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'monthDay' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'monthDay'}
													>{$_('rename.dateMonthDay')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'dayOnly' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'dayOnly'}
													>{$_('rename.dateDayOnly')}</button>
													<span class="text-slate-300 dark:text-slate-600">|</span>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'hourOnly' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'hourOnly'}
													>{$_('rename.dateHourOnly')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'hourMinute' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'hourMinute'}
													>{$_('rename.dateHourMinute')}</button>
													<button
														class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.datePrecision === 'time' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
														onclick={() => editingRule.datePrecision = 'time'}
													>{$_('rename.dateTime')}</button>
												</div>
											</div>
									<div>
										<p class="text-xs text-slate-500 mb-2">{$_('rename.dateSeparator')}</p>
										<div class="flex gap-2 flex-wrap">
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateSeparator === 'dash' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateSeparator = 'dash'}
											>2024-01-30</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateSeparator === 'underscore' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateSeparator = 'underscore'}
											>2024_01_30</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateSeparator === 'none' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateSeparator = 'none'}
											>20240130</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateSeparator === 'chinese' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateSeparator = 'chinese'}
											>2024年01月30日</button>
										</div>
									</div>
								{#if editingRule.dateSeparator !== 'chinese' && ['hour', 'minute', 'second', 'time', 'hourMinute'].includes(editingRule.datePrecision)}
									<div>
										<p class="text-xs text-slate-500 mb-2">{$_('rename.dateTimeSeparator')}</p>
										<div class="flex gap-2 flex-wrap">
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateTimeSeparator === 'underscore' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateTimeSeparator = 'underscore'}
											>日期_时间</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateTimeSeparator === 'dash' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateTimeSeparator = 'dash'}
											>日期-时间</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.dateTimeSeparator === 'none' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.dateTimeSeparator = 'none'}
											>日期时间</button>
										</div>
									</div>
									<div>
										<p class="text-xs text-slate-500 mb-2">{$_('rename.timeSeparator')}</p>
										<div class="flex gap-2 flex-wrap">
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.timeSeparator === 'dot' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.timeSeparator = 'dot'}
											>10.30.00</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.timeSeparator === 'dash' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.timeSeparator = 'dash'}
											>10-30-00</button>
											<button
												class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.timeSeparator === 'none' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
												onclick={() => editingRule.timeSeparator = 'none'}
											>103000</button>
										</div>
									</div>
								{/if}
								<p class="text-xs text-slate-400">{$_('rename.datePreview')}: {formatDateWithOptions(editingRule.datePrecision, editingRule.dateSeparator, editingRule.timeSeparator, editingRule.dateTimeSeparator)}</p>
							</div>
								{:else if editingRule.type === 'size'}
									<div class="space-y-3">
										<div>
											<p class="text-xs text-slate-500 mb-2">{$_('rename.sizeUnit')}</p>
											<div class="flex gap-2 flex-wrap">
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.sizeUnit === 'auto' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.sizeUnit = 'auto'}
												>{$_('rename.sizeAuto')}</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.sizeUnit === 'B' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.sizeUnit = 'B'}
												>B</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.sizeUnit === 'KB' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.sizeUnit = 'KB'}
												>KB</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.sizeUnit === 'MB' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.sizeUnit = 'MB'}
												>MB</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.sizeUnit === 'GB' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.sizeUnit = 'GB'}
												>GB</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.sizeUnit === 'TB' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.sizeUnit = 'TB'}
												>TB</button>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<span class="text-xs text-slate-500">{$_('rename.sizeShowUnit')}</span>
											<button
												class="relative w-10 h-5 rounded-full transition-colors {editingRule.sizeShowUnit ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}"
												onclick={() => editingRule.sizeShowUnit = !editingRule.sizeShowUnit}
											>
												<span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform {editingRule.sizeShowUnit ? 'translate-x-5' : ''}"></span>
											</button>
										</div>
										<p class="text-xs text-slate-400">{$_('rename.datePreview')}: {formatSizeWithUnit(1572864, editingRule.sizeUnit, editingRule.sizeShowUnit)}</p>
									</div>
								{:else if editingRule.type === 'name'}
									<div class="space-y-3">
										<div>
											<p class="text-xs text-slate-500 mb-2">{$_('rename.nameOperation')}</p>
											<div class="flex gap-2 flex-wrap">
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.nameOperation === 'full' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.nameOperation = 'full'}
												>{$_('rename.nameOpFull')}</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.nameOperation === 'replace' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.nameOperation = 'replace'}
												>{$_('rename.nameOpReplace')}</button>
												<button
													class="px-3 py-1.5 text-sm rounded-md transition-colors {editingRule.nameOperation === 'slice' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}"
													onclick={() => editingRule.nameOperation = 'slice'}
												>{$_('rename.nameOpSlice')}</button>
											</div>
										</div>
								{#if editingRule.nameOperation === 'replace'}
									<div class="space-y-2">
										<div class="flex items-center gap-2">
											<input type="text" class="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder={$_('rename.nameFindPlaceholder')} bind:value={editingRule.nameFind} onfocus={() => showNameFindWarning = false} onblur={() => showNameFindWarning = true} />
											<span class="text-slate-400">→</span>
											<input type="text" class="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder={$_('rename.nameReplacePlaceholder')} bind:value={editingRule.nameReplace} />
										<button
											class="px-3 py-1.5 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
											onclick={() => editingRuleId = null}
										>{$_('rename.nameOpReplace')}</button>
										</div>
										{#if showNameFindWarning && editingRule.nameFind && sortedFiles.length > 0}
											{@const unmatchedFiles = sortedFiles.filter(f => { const baseName = f.name.includes('.') ? f.name.slice(0, f.name.lastIndexOf('.')) : f.name; return !baseName.includes(editingRule.nameFind); })}
											{#if unmatchedFiles.length > 0}
												<div class="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
													<p class="text-xs text-amber-600 dark:text-amber-400">{$_('rename.nameNoMatch', { values: { count: unmatchedFiles.length } })}</p>
													<p class="text-xs text-amber-500 dark:text-amber-500 mt-1 truncate" title={unmatchedFiles.map(f => f.name).join(', ')}>{unmatchedFiles.slice(0, 5).map(f => f.name).join(', ')}{unmatchedFiles.length > 5 ? '...' : ''}</p>
												</div>
											{/if}
										{/if}
									</div>
								{:else if editingRule.nameOperation === 'slice'}
									<div class="flex items-center gap-2">
										<span class="text-xs text-slate-500">{$_('rename.nameSliceStart')}</span>
										<input
											type="number"
											class="w-20 px-2 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
											bind:value={editingRule.nameSliceStart}
											min="0"
										/>
										<span class="text-xs text-slate-500">{$_('rename.nameSliceEnd')}</span>
										<input
											type="number"
											class="w-20 px-2 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
											bind:value={editingRule.nameSliceEnd}
											min="0"
										/>
										<span class="text-xs text-slate-400">({$_('rename.nameSliceHint')})</span>
									</div>
								{/if}
							</div>
						{:else if editingRule.type === 'separator'}
							<div>
								<p class="text-xs text-slate-500 mb-2">{$_('rename.separatorHint')}</p>
								<div class="flex gap-2 flex-wrap">
									{#each separatorOptions as sep}
										<button
											class="w-10 h-10 text-lg font-mono rounded-md transition-colors {editingRule.value === sep ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}"
											onclick={() => editingRule.value = sep}
										>{sep}</button>
									{/each}
								</div>
							</div>
						{:else if editingRule.type === 'random'}
							<div class="space-y-3">
								<div class="flex items-center gap-4">
									<span class="text-xs text-slate-500">{$_('rename.randomLength')}</span>
									<input
										type="number"
										class="w-20 px-2 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
										bind:value={editingRule.randomLength}
										min="1"
										max="32"
									/>
								</div>
								<div>
									<p class="text-xs text-slate-500 mb-2">{$_('rename.randomChars')}</p>
									<div class="flex gap-3">
										<label class="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												class="w-4 h-4 rounded"
												checked={editingRule.randomUseDigits}
												onchange={(e) => {
													const newValue = e.currentTarget.checked;
													if (!newValue && !editingRule.randomUseLower && !editingRule.randomUseUpper) {
														e.currentTarget.checked = true;
														return;
													}
													editingRule.randomUseDigits = newValue;
												}}
											/>
											<span class="text-sm">{$_('rename.randomDigits')}</span>
										</label>
										<label class="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												class="w-4 h-4 rounded"
												checked={editingRule.randomUseLower}
												onchange={(e) => {
													const newValue = e.currentTarget.checked;
													if (!newValue && !editingRule.randomUseDigits && !editingRule.randomUseUpper) {
														e.currentTarget.checked = true;
														return;
													}
													editingRule.randomUseLower = newValue;
												}}
											/>
											<span class="text-sm">{$_('rename.randomLower')}</span>
										</label>
										<label class="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												class="w-4 h-4 rounded"
												checked={editingRule.randomUseUpper}
												onchange={(e) => {
													const newValue = e.currentTarget.checked;
													if (!newValue && !editingRule.randomUseDigits && !editingRule.randomUseLower) {
														e.currentTarget.checked = true;
														return;
													}
													editingRule.randomUseUpper = newValue;
												}}
											/>
											<span class="text-sm">{$_('rename.randomUpper')}</span>
										</label>
									</div>
								</div>
								<p class="text-xs text-slate-400">{$_('rename.datePreview')}: {generateRandomString(editingRule.randomLength, editingRule.randomUseDigits, editingRule.randomUseLower, editingRule.randomUseUpper)}</p>
							</div>
						{/if}
						</div>
					{/if}
				{/if}
			{/if}
					<p class="text-xs text-slate-400 dark:text-slate-500 mt-3">{$_('rename.dragHint')}</p>
				</Card.Content>
			</Card.Root>

			<!-- 文件列表 -->
			<Card.Root class="mb-4">
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between">
						<Card.Title class="text-base">{$_('rename.fileList')} ({files.length})</Card.Title>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" onclick={openFileDialog}>
								<Plus class="w-4 h-4 mr-1" />
								{$_('rename.addMore')}
							</Button>
							<Button variant="ghost" size="sm" onclick={reset}>
								<Trash2 class="w-4 h-4 mr-1" />
								{$_('rename.clearAll')}
							</Button>
						</div>
					</div>
					<!-- 排序设置 -->
					<div class="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
						<div class="flex items-center gap-2">
							<span class="text-sm text-slate-500 dark:text-slate-400">{$_('rename.sortBy')}</span>
							<div class="flex">
								<button
									class="px-2 py-1 text-xs border transition-all rounded-l-sm {sortBy === 'name' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
									onclick={() => (sortBy = 'name')}
								>{$_('rename.sortName')}</button>
								<button
									class="px-2 py-1 text-xs border transition-all -ml-px {sortBy === 'size' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
									onclick={() => (sortBy = 'size')}
								>{$_('rename.sortSize')}</button>
								<button
									class="px-2 py-1 text-xs border transition-all -ml-px {sortBy === 'created' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
									onclick={() => (sortBy = 'created')}
								>{$_('rename.sortCreated')}</button>
								<button
									class="px-2 py-1 text-xs border transition-all -ml-px rounded-r-sm {sortBy === 'modified' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
									onclick={() => (sortBy = 'modified')}
								>{$_('rename.sortModified')}</button>
							</div>
							{#if sortBy === 'name'}
								<div class="flex ml-2 pl-2 border-l border-slate-300 dark:border-slate-600">
									<button
										class="px-2 py-1 text-xs border transition-all rounded-l-sm {!sortByNewName ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										onclick={() => (sortByNewName = false)}
									>{$_('rename.sortOldName')}</button>
									<button
										class="px-2 py-1 text-xs border transition-all -ml-px rounded-r-sm {sortByNewName ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										onclick={() => (sortByNewName = true)}
									>{$_('rename.sortNewName')}</button>
								</div>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm text-slate-500 dark:text-slate-400">{$_('rename.sortOrder')}</span>
							<div class="flex">
								<button
									class="px-2 py-1 text-xs border transition-all rounded-l-sm {sortOrder === 'asc' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
									onclick={() => (sortOrder = 'asc')}
								>{$_('rename.asc')}</button>
								<button
									class="px-2 py-1 text-xs border transition-all -ml-px rounded-r-sm {sortOrder === 'desc' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
									onclick={() => (sortOrder = 'desc')}
								>{$_('rename.desc')}</button>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm text-slate-500 dark:text-slate-400">{$_('rename.columns')}:</span>
							<div class="flex items-center gap-1">
								<button
									class="w-6 h-6 flex items-center justify-center text-xs rounded transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
									onclick={() => listColumns = Math.max(1, listColumns - 1)}
									disabled={listColumns <= 1}
								>-</button>
								<span class="w-6 text-center text-sm">{listColumns}</span>
								<button
									class="w-6 h-6 flex items-center justify-center text-xs rounded transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
									onclick={() => listColumns = Math.min(6, listColumns + 1)}
									disabled={listColumns >= 6}
								>+</button>
							</div>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					{@const maxVisible = listColumns * LIST_COLLAPSED_ROWS}
					{@const hasMore = previewFiles.length > maxVisible}
					{@const displayFiles = listExpanded ? previewFiles : previewFiles.slice(0, maxVisible)}
					<div class="gap-2" style="display: grid; grid-template-columns: repeat({listColumns}, minmax(0, 1fr))">
						{#each displayFiles as file, i}
							<div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
								<!-- 第一行：序号 + 旧文件名（删除线） + 删除按钮 -->
								<div class="flex items-center gap-2 mb-2">
									<span class="text-sm font-medium text-slate-500 dark:text-slate-400 w-6 shrink-0">{i + 1}</span>
									<p class="flex-1 truncate text-slate-400 dark:text-slate-500 text-sm line-through" title={file.name}>{file.name}</p>
									<button
										class="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
										onclick={() => {
											const idx = files.findIndex(f => f.path === file.path);
											if (idx !== -1) removeFile(idx);
										}}
									>
										<X class="w-4 h-4" />
									</button>
								</div>
								<!-- 第二行：新文件名 -->
								<div class="ml-8">
									{#if editingPath === file.path}
										<div class="flex items-center">
											<input
												type="text"
												class="flex-1 min-w-0 px-2 py-1 text-sm rounded-l border border-r-0 border-primary bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
												bind:value={editingValue}
												onkeydown={(e) => {
													if (e.key === 'Enter') saveEdit();
													if (e.key === 'Escape') cancelEdit();
												}}
												onblur={saveEdit}
											/>
											{#if editingExt}
												<span class="px-2 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-l-0 border-primary rounded-r">{editingExt}</span>
											{/if}
										</div>
									{:else}
										<button
											class="truncate font-medium text-primary text-sm hover:underline cursor-pointer text-left w-full flex items-center gap-1"
											title={$_('rename.clickToEdit')}
											onclick={() => startEdit(file.path, file.newName)}
										>
											<span class="truncate">{file.newName}</span>
											<Pencil class="w-3 h-3 shrink-0 opacity-50" />
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
					{#if hasMore}
						<button
							class="w-full mt-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center gap-1 border-t border-slate-200 dark:border-slate-700"
							onclick={() => listExpanded = !listExpanded}
						>
							{#if listExpanded}
								{$_('rename.collapse')}
								<ChevronLeft class="w-4 h-4 rotate-90" />
							{:else}
								{$_('rename.expand', { values: { count: previewFiles.length - maxVisible } })}
								<ChevronLeft class="w-4 h-4 -rotate-90" />
							{/if}
						</button>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- 输出设置 -->
			<Card.Root class="mb-4">
				<Card.Content class="py-4">
					<div class="flex flex-wrap items-center gap-6">
						<div class="flex items-center gap-3">
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300">{$_('rename.copyMode')} <HintIcon text={$_('rename.copyModeHint')} /></span>
							<button
								class="relative w-11 h-6 rounded-full transition-colors {copyMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}"
								onclick={() => (copyMode = !copyMode)}
							>
								<span class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform {copyMode ? 'translate-x-5' : ''}"></span>
							</button>
						</div>
						{#if copyMode}
							<div class="flex items-center gap-3">
								<span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{$_('rename.copyModeType')}:</span>
								<div class="flex">
									<button
										class="px-3 py-1.5 text-xs border transition-all rounded-l-md {copyModeType === 'inplace'
											? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10'
											: 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										onclick={() => copyModeType = 'inplace'}
									>
										{$_('rename.copyModeInplace')}
									</button>
									<button
										class="px-3 py-1.5 text-xs border transition-all -ml-px rounded-r-md {copyModeType === 'archive'
											? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 z-10'
											: 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}"
										onclick={() => copyModeType = 'archive'}
									>
										{$_('rename.copyModeArchive')}
									</button>
								</div>
								<HintIcon text={copyModeType === 'inplace' ? $_('rename.copyModeInplaceHint') : $_('rename.copyModeArchiveHint')} />
							</div>
						{/if}
					</div>
					{#if copyMode && copyModeType === 'archive'}
						<div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div class="flex items-center gap-2 flex-1 min-w-0">
								<span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{$_('rename.outputDir')}:</span>
								<div class="flex-1 min-w-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-sm truncate">
									{outputDir || $_('rename.notSelected')}
								</div>
								<Button variant="outline" size="sm" onclick={selectOutputDir}>
									<FolderOpen class="w-4 h-4 mr-1" />
									{$_('rename.select')}
								</Button>
							</div>
						</div>
						{#if outputDir}
							<div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
								<label class="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										class="w-4 h-4 rounded"
										bind:checked={useSubfolder}
									/>
									<span class="text-sm text-slate-600 dark:text-slate-400">{$_('rename.createSubfolder')}</span>
								</label>
								{#if useSubfolder}
									<div class="flex items-center gap-2 flex-1 min-w-0">
										<input
											type="text"
											class="flex-1 min-w-0 px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
											placeholder={$_('rename.subfolderPlaceholder')}
											bind:value={subfolderName}
										/>
									</div>
								{/if}
								{#if useSubfolder && subfolderName.trim()}
									<div class="w-full text-xs text-slate-400 dark:text-slate-500 truncate">
										{$_('rename.outputPath')}: {actualOutputDir}
									</div>
								{/if}
							</div>
						{/if}
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- 执行按钮 -->
			<div class="flex items-center justify-center gap-4 mb-4">
				<Button
					variant="default"
					size="lg"
					onclick={executeRename}
					disabled={processing || previewFiles.length === 0 || (copyMode && copyModeType === 'archive' && !outputDir) || (copyMode && copyModeType === 'archive' && useSubfolder && !subfolderName.trim())}
				>
					{#if processing}
						<span class="animate-spin mr-2">⏳</span>
						{$_('rename.processing')}
					{:else}
						{#if copyMode}
							<Copy class="w-5 h-5 mr-2" />
							{$_('rename.executeCopy')}
						{:else}
							<Play class="w-5 h-5 mr-2" />
							{$_('rename.executeRename')}
						{/if}
					{/if}
				</Button>
			</div>

			{#if processResult}
				<div class="text-center mb-4">
					<p class="text-sm {processResult.failed === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}">
						{$_('rename.resultSuccess', { values: { count: processResult.success } })}
						{#if processResult.failed > 0}
							, {$_('rename.resultFailed', { values: { count: processResult.failed } })}
						{/if}
					</p>
					{#if copyMode && processResult.success > 0}
						<Button variant="outline" size="sm" class="mt-2" onclick={openOutputFolder}>
							<FolderOpen class="w-4 h-4 mr-1" />
							{$_('rename.openOutputFolder')}
						</Button>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
