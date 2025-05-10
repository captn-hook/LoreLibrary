<script>
    export let data;
    import { browser } from "$app/environment";
    import { getEntry } from "$lib/scripts/world";
    import NumberList from "$lib/components/textComponents/numberList.svelte";
    import BulletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import { showStyleControls } from "$lib/state/editState.svelte";
    import { onMount } from "svelte";
    import { updateSettingsFromCurrentStyles } from "$lib/scripts/generator/generate-css.js";
    import StyleEditor from "$lib/components/editComponents/theme/styleEditor.svelte";
    import HtmlReader from "$lib/components/textComponents/htmlReader.svelte";
    import Router from "$lib/components/navigationComponents/router.svelte";

    onMount(() => {
    updateSettingsFromCurrentStyles();

    document.documentElement.setAttribute('data-theme', 'generated');
});
</script>

{#if browser}
    {#await getEntry(data.worldid, data.collectionid, data.entryid) then entry}
    <div class="ml-3">
        <Router/>
        {#each entry?.content ?? [] as { key, value }}
        {console.log(key)}
            {#if key === 'title'}
                <h1 class="text-4xl font-bold text-primary">{value}</h1>
            {:else if key === 'text'}
                <p class="text-base">{value}</p>
            {:else if key === 'numberedList'}
                <NumberList items={value} />
            {:else if key === 'bulletList'}
                <BulletList items={value} />
            {:else if key === 'image'}
                <img src={value} alt={value} />
            {:else if key === 'md'}
                <MarkdownReader md={value} />
            {:else if key === 'html'}
                <HtmlReader html={value} />
            {/if}
        {/each}
    </div>
    {:catch error}
        <p>Error loading world: {error.message}</p>
    {/await}
    {#if $showStyleControls}
        <StyleEditor/>
    {/if}
{/if}


