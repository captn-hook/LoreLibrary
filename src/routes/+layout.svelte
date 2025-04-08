<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/header.svelte';
	
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
	}
</script>
<Header/>
<nav>
	<button
		class="preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800"
        onclick={() => setTheme(getRandomTheme())}
	>
		Change Theme
	</button>
</nav>
{@render children()}
