<script lang="ts">
import {Tabs} from '@skeletonlabs/skeleton-svelte';
import { onMount } from 'svelte';
import Controls from '$lib/components/editComponents/theme/generator/Controls/Controls.svelte';
import { updateSettingsFromCurrentStyles } from '$lib/scripts/generator/generate-css.js';
import SelectTheme from '$lib/components/editComponents/theme/selectTheme.svelte';
import { showStyleControls } from "$lib/state/editState.svelte";

	let group = 'premade';
	let isResizing = false;

	const MIN_WIDTH = 200;
	const MAX_WIDTH = 800;


	onMount(() => {
		updateSettingsFromCurrentStyles();
		console.log('Style editor mounted');

		document.documentElement.setAttribute('data-theme', 'generated');

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

	function closeEditor() {
		showStyleControls.set(false);
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
			on:mousedown={() => (isResizing = true)}
		></div>

	<!-- Editor Content -->
	<div class="style-editor p-1">
		<Tabs value={group} onValueChange={(event) => {group = event.value;}} fluid>
			{#snippet list()}
			<button on:click={closeEditor} class="close-tab" aria-label="Close style editor">
				<Tabs.Control value="close">X</Tabs.Control>
			</button>
			<Tabs.Control value="premade">Pre-made Theme</Tabs.Control>
			<Tabs.Control value="custom">Custom Theme</Tabs.Control>
			{/snippet}
			{#snippet content()}
			<Tabs.Panel value="premade">
				<SelectTheme/>
			</Tabs.Panel>

			<Tabs.Panel value="custom">
				<div class="flex flex-col">
					<Controls/>
				</div>
			</Tabs.Panel>
			{/snippet}
		</Tabs>
	</div>
</div>
