<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>悠然工具箱</title>
</svelte:head>

{@render children()}
