<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { HintIcon } from '$lib/components/ui/hint-icon';
	import { toast } from '$lib/components/ui/toast';
	import { Tab } from '$lib/components/ui/tab';
	import { ArrowLeftRight, Trash2, Copy } from 'lucide-svelte';
	import { diffChars, diffWords, diffLines } from 'diff';

	let leftText: string = $state('');
	let rightText: string = $state('');
	let diffMode: 'chars' | 'words' | 'lines' = $state('words');
	let diffResult: Array<{ value: string; added?: boolean; removed?: boolean }> = $state([]);

	function compare() {
		if (!leftText && !rightText) {
			diffResult = [];
			return;
		}
		switch (diffMode) {
			case 'chars':
				diffResult = diffChars(leftText, rightText);
				break;
			case 'words':
				diffResult = diffWords(leftText, rightText);
				break;
			case 'lines':
				diffResult = diffLines(leftText, rightText);
				break;
		}
	}

	function clear() {
		leftText = '';
		rightText = '';
		diffResult = [];
	}

	function swap() {
		const temp = leftText;
		leftText = rightText;
		rightText = temp;
		compare();
		toast.info($_('textDiff.swapped'));
	}

	function copyDiffResult() {
		const text = diffResult.map(p => p.value).join('');
		navigator.clipboard.writeText(text);
		toast.success($_('textDiff.copied'));
	}

	$effect(() => {
		compare();
	});

	const stats = $derived.by(() => {
		let added = 0;
		let removed = 0;
		let unchanged = 0;
		for (const part of diffResult) {
			if (part.added) added += part.value.length;
			else if (part.removed) removed += part.value.length;
			else unchanged += part.value.length;
		}
		return { added, removed, unchanged };
	});
</script>

<div class="px-6 py-8 max-w-5xl mx-auto">
		<header class="mb-8">
			<h1 class="text-2xl font-bold text-foreground">{$_('features.textDiff.title')}</h1>
			<p class="text-muted-foreground mt-1">{$_('features.textDiff.desc')}</p>
		</header>

		<!-- 工具栏 -->
		<div class="flex flex-wrap items-center gap-4 mb-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-500">{$_('textDiff.mode')}</span>
				<Tab options={[
					{ value: 'chars', label: $_('textDiff.byChar') },
					{ value: 'words', label: $_('textDiff.byWord') },
					{ value: 'lines', label: $_('textDiff.byLine') }
				]} bind:value={diffMode} />
			</div>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={swap}>
					<ArrowLeftRight class="w-4 h-4 mr-1" />
					{$_('textDiff.swap')}
				</Button>
				<Button variant="outline" size="sm" onclick={clear}>
					<Trash2 class="w-4 h-4 mr-1" />
					{$_('textDiff.clear')}
				</Button>
			</div>
		</div>

		<!-- 输入区域 -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-base">{$_('textDiff.original')}</Card.Title>
				</Card.Header>
				<Card.Content>
					<textarea
						class="w-full h-48 px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
						placeholder={$_('textDiff.originalPlaceholder')}
						bind:value={leftText}
					></textarea>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-base">{$_('textDiff.modified')}</Card.Title>
				</Card.Header>
				<Card.Content>
					<textarea
						class="w-full h-48 px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
						placeholder={$_('textDiff.modifiedPlaceholder')}
						bind:value={rightText}
					></textarea>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- 对比结果 -->
		{#if diffResult.length > 0}
			<Card.Root>
				<Card.Header class="pb-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Card.Title class="text-base">{$_('textDiff.result')}</Card.Title>
							<Button variant="ghost" size="sm" onclick={copyDiffResult}>
								<Copy class="w-4 h-4" />
							</Button>
						</div>
						<div class="flex gap-4 text-sm">
							<span class="text-green-600 dark:text-green-400">+{stats.added} {$_('textDiff.added')}</span>
							<span class="text-red-600 dark:text-red-400">-{stats.removed} {$_('textDiff.removed')}</span>
							<span class="text-slate-500">{stats.unchanged} {$_('textDiff.unchanged')}</span>
						</div>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg font-mono text-sm whitespace-pre-wrap break-all">
						{#each diffResult as part}
							{#if part.added}
								<span class="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300">{part.value}</span>
							{:else if part.removed}
								<span class="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through">{part.value}</span>
							{:else}
								<span>{part.value}</span>
							{/if}
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
