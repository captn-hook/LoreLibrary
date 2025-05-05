<script lang="ts">

    import {updateSettingsFromCurrentStyles} from '$lib/scripts/generator/generate-css'
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
    let selectedTheme = themes[0];
</script>

<div class='w-full'>

    <select
    class="select select-bordered w-full m-x-3"
        bind:value={selectedTheme}
        on:change={() => setTheme(selectedTheme)}
    >
        {#each themes as theme}
            <option value={theme}>{theme}</option>
        {/each}
    </select>
</div>