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

	function setTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-style')?.remove();
        updateSettingsFromCurrentStyles();
	}
    let selectedTheme = '';
</script>
<div class='w-full flex flex-col justify-center items-left p-2'>
    <p>Choose from a selection of pre-made themes.</p>
    <select
    class="select select-bordered w-[95%]"
        bind:value={selectedTheme}
        on:change={() => setTheme(selectedTheme)}
    >
        <option value="" disabled selected>Select a theme</option>
        {#each themes as theme}
            <option value={theme}>{theme}</option>
        {/each}
    </select>
</div>