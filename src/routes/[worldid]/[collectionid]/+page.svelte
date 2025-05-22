<script lang="ts">
    export let data;
    import {getCollection} from "$lib/scripts/world";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    import { onMount } from "svelte";
    import Router from "$lib/components/navigationComponents/router.svelte";
    import {collections} from "$lib/state/worldState.svelte";
    import {Collection} from "$lib/types/collection";
    import {editContent} from "$lib/state/editState.svelte";
    import Content from "$lib/components/content.svelte";
    import EditableContent from "$lib/components/editComponents/editableContent.svelte";


    let collection: Collection;
    onMount(async () => {
    if (!$collections?.some(collection => collection.id === data.collectionid)) {
        await getCollection(data.worldid, data.collectionid);
    }
    collections.subscribe(value => {
        collection = value?.find(collection => collection.id === data.collectionid) ?? {} as Collection;
    });
});
    function getNavItems(collection: Collection): {name: string, href: string}[] {
        let navItems : {name: string, href: string}[] = [];
        collection?.collections.forEach(c => {
            navItems.push({name: c, href: `/${data.worldid}/${c}`});
        });
        collection?.entries.forEach(e => {
            navItems.push({name: e, href: `/${data.worldid}/${collection.id}/${e}`});
        });
        return navItems;
    }
</script>

<div>
    <Navbar navItems={getNavItems(collection)} />
    <div class="ml-3">
        <Router/>
        {#if $editContent == false}
        <Content content={collection?.content ?? []}/>
        {:else}
        <EditableContent content={collection?.content ?? []}/>
        {/if}
    </div>
</div>
