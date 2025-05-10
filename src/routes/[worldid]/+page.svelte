<script lang="ts">
    import {getWorld} from "$lib/scripts/world";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BullletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
  import { showStyleControls } from "$lib/state/editState.svelte";
  import StyleEditor from "$lib/components/editComponents/theme/styleEditor.svelte";
  import Router from "$lib/components/navigationComponents/router.svelte";
    export let data;
    const getNavItems = (collections: Array<{ key: string } | string> | undefined) => 
            collections?.map((collection) => ({
                name: typeof collection === 'string' ? collection : collection.key,
                href: `/${data.worldid}/${typeof collection === 'string' ? collection : collection.key}`
            }));
            




</script>

{#await getWorld(data.worldid) then world}
    {console.log(world)}
    <Navbar navItems={getNavItems(world?.collections)} />
    <div class="ml-3">
        <Router/>
            {#each world?.content ?? [] as component}
                {#if component.key === 'text'}
                    <p>{component.value}</p>
                {:else if component.key === 'title'}
                    <h1 class="text-4xl font-bold text-primary">{component.value}</h1>
                {:else if component.key == 'image_url'}
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
    {#if $showStyleControls}
        <StyleEditor/>
    {/if}
{:catch error}
    <p>Error loading world: {error.message}</p>
{/await}
    