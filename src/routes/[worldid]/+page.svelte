<script type="ts">
    import { world as importedWorld } from "$lib/context/worldContext.svelte";
    import {getWorld} from "$lib/scripts/world";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BullletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    export let data;
</script>
{#await getWorld(data.worldid) then world}
    {console.log(world)}
    <Navbar navItems={world?.collections?.map(collection => ({
        name: typeof collection === 'string' ? collection : collection.key,
        href: `/${data.worldid}/${typeof collection === 'string' ? collection : collection.key}`
    }))} />
    <div class="ml-5">
        <h2>Viewing World:  {world?.id}</h2>
            {#each world?.content ?? [] as component}
                {#if component.key === 'text'}
                    <p>{component.value}</p>
                {:else if component.key === 'title'}
                    <h1>{component.value}</h1>
                {:else if component.key === 'image_url'}
                    <img src={component.value} alt={component.value} />
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
    </div>
{:catch error}
    <p>Error loading world: {error.message}</p>
{/await}
    