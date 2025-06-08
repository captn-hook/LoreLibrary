<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/header.svelte';
	import '$lib/scripts/user.ts';

	let { children } = $props();
</script>

<style>
	:root {
		--style-editor-width: 25%;
	}
</style>

<div class="flex w-full h-full">
	<!-- Main Content -->
	<div class="flex-grow" style="width: calc(100% - var(--style-editor-width));">
		<Header/>
		{@render children()}
	</div>
</div>