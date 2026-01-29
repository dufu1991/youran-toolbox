<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>娟娟工具箱</title>
</svelte:head>

{@render children()}
