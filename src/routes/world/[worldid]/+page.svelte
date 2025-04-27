<script type="ts">
    import { world as importedWorld } from "$lib/context/worldContext.svelte";
    import {getWorld} from "$lib/scripts/world";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BullletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";

    export let data;
</script>

{#await getWorld(data.worldid) then world}
    {console.log(world)}
    <h2>Viewing World:  {world?.name}</h2>
    <p>{world?.description}</p>
        {#each world?.entry?.content ?? [] as component}
            {#if component.key === 'text'}
                <p>{component.value}</p>
            {:else if component.key === 'numberedList'}
                <NumberList items={component.value} />
            {:else if component.key === 'bulletList'}
                <BullletList items={component.value} />
            {:else if component.key === 'image'}
                <img src={component.value} alt={component.value} />'
            {:else if component.key === 'md'}
                <MarkdownReader md={component.value} />
            {/if}
        {/each}
{:catch error}
    <p>Error loading world: {error.message}</p>
{/await}