<script lang="ts">
    export let data;

    import {getEntry} from "$lib/scripts/world";
    import Router from "$lib/components/navigationComponents/router.svelte";
    import Content from "$lib/components/content.svelte";
    import { editContent } from "$lib/state/editState.svelte";
    import EditableContent from "$lib/components/editComponents/editableContent.svelte";
    import { onDestroy, onMount } from "svelte";
    import {entry as entryContext} from "$lib/state/worldState.svelte";


    let editContentValue;
    const unsubscribe = editContent.subscribe(value => {
        editContentValue = value;
    });
    
    onDestroy(() => {
        unsubscribe();
    });
    onMount(async () => {
        if ($entryContext?.name !== data.entryid) {
            await getEntry(data.worldid, data.collectionid, data.entryid);
        }
    })
</script>

<div>
    <Router/>
    <div class="flex flex-row">
        <div class="flex-1 ml-3">
            <h1 class="text-4xl font-bold text-primary mb-4">{$entryContext?.name}</h1>
            {#if $editContent == false}
            <Content content={$entryContext?.content ?? []}/>
            {:else}
            <EditableContent content={$entryContext?.content ?? []}/>
            {/if}
        </div>
        <div class="flex-none">
            <img class="relative m-4" src={$entryContext?.image} alt=""/>
        </div>
    </div>
</div>