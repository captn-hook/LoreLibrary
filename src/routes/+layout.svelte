<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/header.svelte';
	import '$lib/scripts/user.ts';
	import { showStyleControls } from "$lib/state/editState.svelte";
	import { updateSettingsFromCurrentStyles, generatePreviewCss } from '$lib/scripts/generator/generate-css';
	import EditMenu from '$lib/components/editComponents/controls/editMenu.svelte';
	import StyleEditor from '$lib/components/editComponents/theme/styleEditor.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();
	onMount(() => {
		updateSettingsFromCurrentStyles(); //preps theme store with values from current theme
	});
</script>

<svelte:head>
    <!--creates style element with duplicate styles under name "generated" prevents style reset when opening the styleEditor-->
	{@html `<style>${generatePreviewCss()}</style>`} 
</svelte:head>

<style>
	:root {
		--style-editor-width: 25%;
	}
</style>

<div class="flex w-full h-full">
	<!-- Main Content -->
	<div class="flex-grow" style="width: calc(100% - var(--style-editor-width));">
		<Header/>
		{#if $page?.url?.pathname !== '/' && $page?.url?.pathname !== '/dashboard' && $page?.url?.pathname !== '/workshop'}
				<EditMenu/>
		{/if}
		{@render children()}
	</div>

	<!-- Sidebar -->
	{#if $showStyleControls}	
			<StyleEditor/>
	{/if}
</div>