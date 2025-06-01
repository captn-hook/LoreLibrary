<script lang="ts">
    export let data;

    import {getWorld} from "$lib/scripts/world";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    import Router from "$lib/components/navigationComponents/router.svelte";
    import Content from "$lib/components/content.svelte";
    import { editContent } from "$lib/state/editState.svelte";
    import EditableContent from "$lib/components/editComponents/editableContent.svelte";
    import { onDestroy, onMount } from "svelte";
    import { world as worldContext} from "$lib/state/worldState.svelte";
    import { routerItems } from "$lib/state/routerState.svelte.js";
    import { RouterItem } from "$lib/types/routerItem";


    let editContentValue;
    const unsubscribe = editContent.subscribe(value => {
        editContentValue = value;
    });

    onDestroy(() => {
        unsubscribe();
    });

    const getNavItems = (collections: Array<{ key: string } | string> | undefined) => 
            collections?.map((collection) => ({
                name: typeof collection === 'string' ? collection : collection.key,
                href: `/${data.worldid}/${typeof collection === 'string' ? collection : collection.key}`
            }));

    onMount(async () => {
        if ($worldContext?.name !== data.worldid) {
            await getWorld(data.worldid);
        }
        routerItems.set([new RouterItem(data.worldid, `/${data.worldid}`)]);
    })
</script>
<div>
    <Navbar navItems={getNavItems($worldContext?.collections)} />
    <div class="ml-3">
        <Router/>
        {#if $editContent == false}
        <Content content={$worldContext?.content ?? []}/>
        {:else}
        <EditableContent content={$worldContext?.content ?? []}/>
        {/if}
    </div>
</div>
    