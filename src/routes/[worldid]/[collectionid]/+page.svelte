<script lang="ts">
    export let data;
    import {browser} from "$app/environment";
    import {getCollection} from "$lib/scripts/world";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BulletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import { showStyleControls } from "$lib/state/editState.svelte";
    import { onMount } from "svelte";
    import {updateSettingsFromCurrentStyles} from "$lib/scripts/generator/generate-css.js";
    import StyleEditor from "$lib/components/editComponents/theme/styleEditor.svelte";

</script>
{#if browser}
    {#await getCollection(data.worldid, data.collectionid) then collection}
    {console.log(collection?.content ?? [])}
    <Navbar navItems={collection?.entries.map((entry: string) => {
        return {
            name: entry,
            href: `/${data.worldid}/${data.collectionid}/${entry}`
        }})}
    />
    <div class="ml-3">
    {#each collection?.content ?? [] as { key, value }}
        {console.log(value)}
                {#if key === 'title'}
                    <h1 class="text-4xl font-bold text-primary">{value}</h1>
                {:else if key === 'text'}
                    <p>{value}</p>
                {:else if key === 'numberedList'}
                    <NumberList items={value} />
                {:else if key === 'bulletList'}
                    <BulletList items={value} />
                {:else if key === 'image'}
                    <img src={value} alt={value} />'
                {:else if key === 'md'}
                    <MarkdownReader md={value} />
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
