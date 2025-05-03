<script lang="ts">
	// State
	import { globals } from '$lib/state/generator.svelte';
	// Components (Skeleton)
	import { Accordion, Segment } from '@skeletonlabs/skeleton-svelte';
	// Components (Settings)
	import ControlsColors from './ControlsColors.svelte';
	import ControlsBackgrounds from './ControlsBackgrounds.svelte';
	import ControlsTypography from './ControlsTypography.svelte';
	import ControlsSpacing from './ControlsSpacing.svelte';
	import ControlsEdges from './ControlsEdges.svelte';
	// Icons
	import IconColors from '@lucide/svelte/icons/palette';
	import IconBackgrounds from '@lucide/svelte/icons/layers-2'; // Note: no dash in 'Layers2'
	import IconTypography from '@lucide/svelte/icons/a-large-small'; // PascalCase
	import IconSpacing from '@lucide/svelte/icons/scaling';
	import IconEdges from '@lucide/svelte/icons/square-dashed';
	import IconOpen from '@lucide/svelte/icons/chevron-up';
	import IconClosed from '@lucide/svelte/icons/chevron-down';

	import {generateTheme} from '$lib/scripts/generator/generate-theme';

	// Local
	const accordionItemProps = {
		controlPadding: 'px-5 py-3',
		controlRounded: 'rounded-none',
		controlHover: 'hover:preset-tonal',
		panelPadding: 'p-5'
	};
	function updateStyling(styling: Object[]) {
		const themeElement = document.querySelector('[data-theme]');
		if (!themeElement) {
			console.error("No element with [data-theme] attribute found.");
			return;
		}
		if (themeElement) {
			console.log(themeElement);
			styling.forEach(style => {
				Object.entries(style).forEach(([key, value]) => {
					(themeElement as HTMLElement).style.setProperty(key, value as string);
				});
			});
		}
	}
	function setTheme() {
		let theme = generateTheme();
		const styleId = 'skeleton-theme-injected';

		// Remove existing injected theme if present
		const oldStyle = document.getElementById(styleId);
		if (oldStyle) oldStyle.remove();

		// Create a new <style> tag with the theme CSS variables
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
			:root {
				${Object.entries(theme.cssVars)
					.map(([key, val]) => `${key}: ${val};`)
					.join('\n')}
			}
		`;

		document.head.appendChild(style);
	}

	let settings: string[] = $state([]);
</script>

<section class="absolute top-0 right-0 h-screen w-1/5 bg-surface-100-900 pb-96 overflow-y-auto border-l border-black">
	<div class="space-y-10">
		<Accordion value={settings} onValueChange={(e) => (settings = e.value)} collapsible spaceY="space-y-0">
			{#snippet iconOpen()}<IconOpen size={16} />{/snippet}
			{#snippet iconClosed()}<IconClosed size={16} />{/snippet}
			<hr class="hr" />
			<!-- Controls: Colors -->
			<Accordion.Item value="colors" {...accordionItemProps}>
				{#snippet lead()}<span class="btn-icon preset-tonal"><IconColors size={20} /></span>{/snippet}
				{#snippet control()}<span class="h4">Color Palette</span>{/snippet}
				{#snippet panel()}<ControlsColors />{/snippet}
			</Accordion.Item>
			<hr class="hr" />
			<!-- Controls: Backgrounds -->
			<Accordion.Item value="backgrounds" {...accordionItemProps}>
				{#snippet lead()}<span class="btn-icon preset-tonal"><IconBackgrounds size={20} /></span>{/snippet}
				{#snippet control()}<span class="h4">Backgrounds</span>{/snippet}
				{#snippet panel()}<ControlsBackgrounds />{/snippet}
			</Accordion.Item>
			<hr class="hr" />
			<!-- Controls: Spacing -->
			<Accordion.Item value="spacing" {...accordionItemProps}>
				{#snippet lead()}<span class="btn-icon preset-tonal"><IconSpacing size={20} /></span>{/snippet}
				{#snippet control()}<span class="h4">Spacing</span>{/snippet}
				{#snippet panel()}<ControlsSpacing />{/snippet}
			</Accordion.Item>
			<hr class="hr" />
			<!-- Controls: Edges -->
			<Accordion.Item value="edges" {...accordionItemProps}>
				{#snippet lead()}<span class="btn-icon preset-tonal"><IconEdges size={20} /></span>{/snippet}
				{#snippet control()}<span class="h4">Edges</span>{/snippet}
				{#snippet panel()}<ControlsEdges />{/snippet}
			</Accordion.Item>
			<hr class="hr" />
			<!-- Controls: Typography -->
			<Accordion.Item value="typography" {...accordionItemProps}>
				{#snippet lead()}<span class="btn-icon preset-tonal"><IconTypography size={20} /></span>{/snippet}
				{#snippet control()}<span class="h4">Typography</span>{/snippet}
				{#snippet panel()}<ControlsTypography />{/snippet}
			</Accordion.Item>
			<hr class="hr" />
		</Accordion>
	</div>
<div class="flex justify-center space-x-3 p-3 preset-primary">
	<button onclick={() => {setTheme()}} class="btn btn-primary preset-filled">Preview</button>
	<button onclick={() => { console.log(generateTheme()) }} class="btn btn-primary preset-filled">Save</button>
	<button onclick={() => { /* Add your save logic here */ }} class="btn btn-secondary preset-filled">Cancel</button>
</div>
</section>
