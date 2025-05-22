<script lang="ts">
	'use client';
	import { Accordion } from '@skeletonlabs/skeleton-svelte'; 
	// Components (Settings)
	import ControlsColors from './ControlsColors.svelte';
	import ControlsBackgrounds from './ControlsBackgrounds.svelte';
	import ControlsTypography from './ControlsTypography.svelte';
	import ControlsSpacing from './ControlsSpacing.svelte';
	import ControlsEdges from './ControlsEdges.svelte';
	// Icons
	import IconColors from '@lucide/svelte/icons/palette';
	import IconBackgrounds from '@lucide/svelte/icons/layers-2';
	import IconTypography from '@lucide/svelte/icons/a-large-small'; 
	import IconSpacing from '@lucide/svelte/icons/scaling';
	import IconEdges from '@lucide/svelte/icons/square-dashed';
	import IconOpen from '@lucide/svelte/icons/chevron-up';
	import IconClosed from '@lucide/svelte/icons/chevron-down';


	// Local
	const accordionItemProps = {
		controlPadding: 'px-5 py-3',
		controlRounded: 'rounded-none',
		controlHover: 'hover:preset-tonal',
		panelPadding: 'p-5'
	};

	function handleSaveTheme() {
		document.documentElement.setAttribute('data-theme', 'generated');
		
	}
	let settings: string[] = $state([]);
</script>

<section class="space-y-0">
	<div class="space-y-0">
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
		<button onclick={handleSaveTheme} class="btn btn-primary preset-filled">Save</button>
		<button onclick={() => { /* Add your cancel logic here */ }} class="btn btn-secondary preset-filled">Cancel</button>

	</div>
</section>
