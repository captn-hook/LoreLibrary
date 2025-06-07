<script lang="ts">
import {Tabs} from '@skeletonlabs/skeleton-svelte';
import { onMount } from 'svelte';
import Controls from '$lib/components/editComponents/theme/generator/Controls/Controls.svelte';
import { generatePreviewCss, updateSettingsFromCurrentStyles } from '$lib/scripts/generator/generate-css.js';
import SelectTheme from '$lib/components/editComponents/theme/selectTheme.svelte';
import { showStyleControls } from "$lib/state/editState.svelte";
import { updateTheme } from '$lib/scripts/world';
import { world, collections, entry} from '$lib/state/worldState.svelte.js';

	let group = 'premade';
	let isResizing = false;
	let initialTheme = document.documentElement.getAttribute('data-theme') || 'generated';

	const MIN_WIDTH = 200;
	const MAX_WIDTH = 800;


	onMount(() => {
		window.addEventListener('mouseup', () => {
			isResizing = false;
		});
		window.addEventListener('mousemove', (e) => {
			if (isResizing) {
				const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - e.clientX));
				document.documentElement.style.setProperty('--style-editor-width', `${newWidth}px`);
			}
		});
	});

	function cancelEditTheme() {
		document.documentElement.setAttribute('data-theme', initialTheme);
		showStyleControls.set(false);
	}

	function handleSaveTheme() {
		let currentTheme = document.documentElement.getAttribute('data-theme')
		if (currentTheme == 'generated'){
			if (confirm('Are you sure you want to save the current theme? You are using a generated theme.')) {
				updateSettingsFromCurrentStyles();
				let previewcss = generatePreviewCss(true);
				previewcss.replace("generated", "custom");
				updateTheme(previewcss);
			}
		}else {//premade theme
			if (confirm('Are you sure you want to save the current theme? You are using a premade theme.')) {
				updateSettingsFromCurrentStyles();
				if (currentTheme){
				updateTheme(currentTheme);
				}
			}


		}
		
	}

	function handleTabChange(value: string) {
		let currentTheme = document.documentElement.getAttribute('data-theme') || 'generated';
		group = value;
		if (value === 'premade') {
			document.documentElement.setAttribute('data-theme', currentTheme);
		} else if (value === 'generated') {
			updateSettingsFromCurrentStyles();
			document.documentElement.setAttribute('data-theme', 'generated');
		}
	}
</script>

<style>
	.style-editor {
		position: fixed;
		top: 0;
		right: 0;
		width: var(--style-editor-width);
		height: 100%;
		background-color: #000000; /* Ensure a solid background color */
		color: #ffffff;
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); /* Optional: Add a shadow for better visibility */
		overflow-y: auto; /* Optional: Add scrolling if content overflows */
		margin: 0; /* Ensure no margin */
		padding: 0; /* Ensure no padding */
	}

	.close-tab {
		color: #ffffff;
		cursor: pointer;
		font-weight: bold;
		text-align: center;
	}
</style>
<div class="relative" style="width: var(--style-editor-width); min-width: ${MIN_WIDTH}px; max-width: ${MAX_WIDTH}px;">
			<!-- Resize handle -->
	<div
		class="absolute top-0 left-0 h-full w-1.5 cursor-ew-resize z-10"
			onmousedown={() => (isResizing = true)}
		></div>

	<!-- Editor Content -->
	<div class="style-editor p-1">
		<Tabs 
			value={group} 
			onValueChange={(event) => {
				group = event.value;
				handleTabChange(event.value);
			}} 
			fluid
		>
			{#snippet list()}
			<button onclick={cancelEditTheme} class="close-tab" aria-label="Close style editor">
				<Tabs.Control value="close">X</Tabs.Control>
			</button>
			<Tabs.Control value="premade">Pre-made Theme</Tabs.Control>
			<Tabs.Control value="generated">Custom Theme</Tabs.Control>
			{/snippet}
			{#snippet content()}
			<Tabs.Panel value="premade">
				<SelectTheme/>
			</Tabs.Panel>

			<Tabs.Panel value="generated">
				<div class="flex flex-col">
					<Controls/>
				</div>
			</Tabs.Panel>
			{/snippet}
		</Tabs>
		<div class="flex justify-center space-x-3 p-3 preset-primary">
			<button onclick={handleSaveTheme} class="btn btn-primary preset-filled">Save</button>
			<button onclick={cancelEditTheme} class="btn btn-secondary preset-filled">Cancel</button>
	
		</div>
	</div>
	
</div>