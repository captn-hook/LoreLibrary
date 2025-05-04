<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/header.svelte';
    import '$lib/scripts/user.ts';
    import { showStyleControls } from "$lib/state/editState.svelte";
    import { updateSettingsFromCurrentStyles } from '$lib/scripts/generator/generate-css';
    import { generatePreviewCss } from '$lib/scripts/generator/generate-css';
	let { children } = $props();

	
    const themes = [
        'mint',
        'catppuccin',
        'concord',
        'crimson',
        'fennec',
        'hamlindigo',
        'legacy',
        'modern',
        'cerberus',
        'mona',
        'nosh',
        'nouveau',
        'pine',
        'reign',
        'rocket',
        'rose',
        'sahara',
        'seafoam',
        'terminus',
        'vintage',
        'vox',
        'wintry'
    ];

	function getRandomTheme() {
		const randomIndex = Math.floor(Math.random() * themes.length);
		return themes[randomIndex];
	}

	function setTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
        updateSettingsFromCurrentStyles();
	}

    


</script>
<svelte:head>
{@html `<style>${generatePreviewCss()}</style>`}
</svelte:head>
<Header/>
<nav>
	<button
		class="preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800"
        onclick={() => setTheme(getRandomTheme())}
	>
		Change Theme
	</button>
    {#if (typeof window !== 'undefined' && location.pathname != '/' && location.pathname != '/dashboard' && location.pathname != '/workshop') }
    <button 
        class="preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800"
        onclick={() => {console.log($showStyleControls);
            showStyleControls.set(!$showStyleControls)}}
        >Edit Style
    </button>
    {/if}
</nav>
{@render children()}
