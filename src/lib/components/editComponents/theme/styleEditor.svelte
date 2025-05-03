<script lang="ts">
import SvelteAwesomeColorPicker from 'svelte-awesome-color-picker';
import {Tabs} from '@skeletonlabs/skeleton-svelte';
import { colord, Colord } from 'colord';
import { onMount } from 'svelte';

    let primaryColorHex : string | null;
	let secondaryColorHex = '#100001';
	let trinaryColorHex = '#000000';
    let rootStyles: CSSStyleDeclaration;
	$: primaryColorHex;
	$: secondaryColorHex;
	$: trinaryColorHex;

	let group = 'premade';
    onMount(() => {
        rootStyles = getComputedStyle(document.documentElement);
        primaryColorHex = colord(rootStyles.getPropertyValue('--color-primary-950').trim()).toHex();
        secondaryColorHex = colord(rootStyles.getPropertyValue('--color-secondary-950').trim()).toHex();
        trinaryColorHex = colord(rootStyles.getPropertyValue('--color-tertiary-950').trim()).toHex();
        console.log(rootStyles);
    });

	function updateCssVar(name: string, value: string) {
		document.documentElement.style.setProperty(name, value);
	}
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
			<h2>Custom Theme</h2>
			<p>Create your own theme by selecting colors.</p>

			<SvelteAwesomeColorPicker
				color={colord(primaryColorHex) || rootStyles.getPropertyValue('--color-primary-950').trim()}
				label="Primary Color"
				onInput={(event) => {
					if (event.hex) {
						primaryColorHex = event.hex;
						updateCssVar('--color-primary-950', primaryColorHex);
					}
				}}
			/>

			<SvelteAwesomeColorPicker
				color={colord(secondaryColorHex)}
				label="Secondary Color"
				onInput={(event) => {
					if (event.hex) {
						secondaryColorHex = event.hex;
						updateCssVar('--color-secondary-950', secondaryColorHex);
					}
				}}
			/>

			<SvelteAwesomeColorPicker
				color={colord(trinaryColorHex)}
				label="Trinary Color"
				onInput={(event) => {
					if (event.hex) {
						trinaryColorHex = event.hex;
						updateCssVar('--color-tertiary-950', trinaryColorHex);
					}
				}}
			/>
		</div>
	</Tabs.Panel>
    {/snippet}
</Tabs>
</div>

