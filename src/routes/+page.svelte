<script lang="ts">
	import { _ } from 'svelte-i18n';
	import * as Card from '$lib/components/ui/card';
	import { FolderOpen, Layers, FileText } from 'lucide-svelte';

	const features = [
		{
			titleKey: 'features.classify.title',
			descKey: 'features.classify.desc',
			icon: FolderOpen,
			href: '/classify'
		},
		{
			titleKey: 'features.classifyBatch.title',
			descKey: 'features.classifyBatch.desc',
			icon: Layers,
			href: '/classify-batch'
		},
		{
			titleKey: 'features.rename.title',
			descKey: 'features.rename.desc',
			icon: FileText,
			href: '/rename'
		}
	];
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
	<div class="container mx-auto max-w-4xl px-6 py-12">
		<header class="text-center mb-12">
			<h1 class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">{$_('app.title')}</h1>
			<p class="text-lg text-slate-500 dark:text-slate-400">{$_('app.subtitle')}</p>
			<p class="text-sm text-slate-400 dark:text-slate-500 mt-2">{$_('app.moreFeatures')}</p>
		</header>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feature}
				<a href={feature.href} class="block group">
					<Card.Root class="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
						<Card.Header>
							<feature.icon class="w-12 h-12 text-primary mb-3" />
							<Card.Title class="text-xl">{$_(feature.titleKey)}</Card.Title>
							<Card.Description class="text-sm">{$_(feature.descKey)}</Card.Description>
						</Card.Header>
					</Card.Root>
				</a>
			{/each}
		</div>
	</div>
</div>
