<script lang="ts">
	import { _ } from 'svelte-i18n';
</script>

<div class="h-full flex flex-col items-center justify-center px-8">
	<img src="/logo.png" alt="Logo" class="w-20 h-20 mb-6 drop-shadow-lg" />
	<h1 class="text-3xl font-bold text-foreground mb-3">{$_('app.title')}</h1>
	<p class="text-base text-muted-foreground text-center">{$_('app.subtitle')}</p>
	<p class="text-sm text-muted-foreground/50 mt-3">{$_('app.moreFeatures')}</p>
</div>
