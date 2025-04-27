<script lang="ts">
    export let data;
    import {browser} from "$app/environment";
    import {getCollection} from "$lib/scripts/world";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BulletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";

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
    <h1>Viewing World: {data.worldid}</h1>
    <h1>Viewing collection: {data.collectionid}</h1>
    {#each collection?.content ?? [] as { key, value }}
        {console.log(value)}
                {#if key === 'title'}
                    <h1>{value}</h1>
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
    {:catch error}
        <p>Error loading world: {error.message}</p>
    {/await}
{/if}
