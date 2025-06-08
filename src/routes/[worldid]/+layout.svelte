<script lang="ts">
	import '../../app.css';
	import '$lib/scripts/user.ts';
	import { showStyleControls } from "$lib/state/editState.svelte";
	import { updateSettingsFromCurrentStyles, generatePreviewCss } from '$lib/scripts/generator/generate-css';
	import EditMenu from '$lib/components/editComponents/controls/editMenu.svelte';
	import StyleEditor from '$lib/components/editComponents/theme/styleEditor.svelte';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import {browser} from '$app/environment';
	import NodeMap from '$lib/components/navigationComponents/nodemap/nodeMap.svelte';
	export const reset = true; // Prevent inheritance from the global layout
	let { children } = $props();
    onMount(() => {
        updateSettingsFromCurrentStyles(); // Preps theme store with values from current theme
    });

    onDestroy(() => {
        // Reset the theme when navigating away
		if (browser){
        	document.documentElement.setAttribute('data-theme', 'pine'); // Reset to default theme
        	document.querySelectorAll('style[data-theme="custom"]').forEach((styleTag) => styleTag.remove()); // Remove custom styles
		}
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
	<div class="flex-grow flex-col flex" style="width: calc(100% - var(--style-editor-width));">
		<div class="flex flex-row justify-end max-h-[5%] w-full">
			<NodeMap/>
		{#if $page?.url?.pathname !== '/' && $page?.url?.pathname !== '/dashboard' && $page?.url?.pathname !== '/workshop'}
				<EditMenu/>
		{/if}
		</div>
		{@render children()}
	</div>

	<!-- Sidebar -->
	{#if $showStyleControls}	
			<StyleEditor/>
	{/if}
</div>