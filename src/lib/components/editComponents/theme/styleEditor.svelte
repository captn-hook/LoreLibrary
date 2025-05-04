<script lang="ts">
import SvelteAwesomeColorPicker from 'svelte-awesome-color-picker';
import {Tabs} from '@skeletonlabs/skeleton-svelte';
import { colord, Colord } from 'colord';
import { onMount } from 'svelte';
import Controls from '$lib/components/editComponents/theme/generator/Controls/Controls.svelte';
import { updateSettingsFromCurrentStyles } from '$lib/scripts/generator/generate-css.js';

	let group = 'premade';


	onMount(() => {
    updateSettingsFromCurrentStyles();

    document.documentElement.setAttribute('data-theme', 'generated');
});
</script>

<style>
	.style-editor {
		position: fixed;
		top: 0;
		right: 0;
		width: 20%;
		height: 100%;
		background-color: #f4f4f4; /* Optional: Add a background color */
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); /* Optional: Add a shadow for better visibility */
		overflow-y: auto; /* Optional: Add scrolling if content overflows */
		margin: 0; /* Ensure no margin */
		padding: 0; /* Ensure no padding */
		
	}
</style>

<div class="style-editor">
    
    <Tabs value={group} onValueChange={(event) => {group = event.value;}} fluid>
        {#snippet list()}
            

	<Tabs.Control value="premade">Pre-made Theme</Tabs.Control>
	<Tabs.Control value="custom">Custom Theme</Tabs.Control>
    {/snippet}
    {#snippet content()}
	<Tabs.Panel value="premade">
		<h2>Pre-made Themes</h2>
		<p>Choose from a selection of pre-made themes.</p>
	</Tabs.Panel>

	<Tabs.Panel value="custom">
		<div class="flex flex-col gap-4">
			<Controls/>
		</div>
	</Tabs.Panel>
    {/snippet}
</Tabs>
</div>

