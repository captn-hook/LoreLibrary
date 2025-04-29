<script>
    export let data;
    import { browser } from "$app/environment";
    import { getEntry } from "$lib/scripts/world";
    import NumberList from "$lib/components/textComponents/numberList.svelte";
    import BulletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
</script>
<div class="ml-3">
{#if browser}
    {#await getEntry(data.worldid, data.collectionid, data.entryid) then entry}
        {#each entry?.content ?? [] as { key, value }}
        {console.log(key)}
            {#if key === 'title'}
                <h1 class="text-4xl font-bold text-primary">{value}</h1>
            {:else if key === 'text'}
                <p>{value}</p>
            {:else if key === 'numberedList'}
                <NumberList items={value} />
            {:else if key === 'bulletList'}
                <BulletList items={value} />
            {:else if key === 'image'}
                <img src={value} alt={value} />
            {:else if key === 'md'}
                <MarkdownReader md={value} />
            {/if}
        {/each}
    {:catch error}
        <p>Error loading world: {error.message}</p>
    {/await}
{/if}
</div>

