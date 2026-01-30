<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { FolderOpen, Layers } from 'lucide-svelte';

	const features = [
		{
			title: '分类归档',
			description: '按指定列将 Excel 数据分类到不同的 Sheet',
			icon: FolderOpen,
			href: '/classify'
		},
		{
			title: '批量分类归档',
			description: '批量处理多个 Excel 文件，统一分类归档',
			icon: Layers,
			href: '/classify-batch'
		}
	];
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<div class="container mx-auto max-w-4xl px-6 py-12">
		<header class="text-center mb-12">
			<h1 class="text-4xl font-bold text-slate-900 mb-3">悠然工具箱</h1>
			<p class="text-lg text-slate-500">提升日常办公效率的桌面工具集</p>
			<p class="text-sm text-slate-400 mt-2">功能持续增加中...</p>
		</header>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feature}
				<a href={feature.href} class="block group">
					<Card.Root class="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
						<Card.Header>
							<feature.icon class="w-12 h-12 text-primary mb-3" />
							<Card.Title class="text-xl">{feature.title}</Card.Title>
							<Card.Description class="text-sm">{feature.description}</Card.Description>
						</Card.Header>
					</Card.Root>
				</a>
			{/each}
		</div>
	</div>
</div>
