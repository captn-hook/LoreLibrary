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
        if ($entryContext?.id !== data.entryid) {
            await getEntry(data.worldid, data.collectionid, data.entryid);
        }
    })
</script>
<div>
    <div class="ml-3">
        <Router/>
        {#if $editContent == false}
        <Content content={$entryContext?.content ?? []}/>
        {:else}
        <EditableContent content={$entryContext?.content ?? []}/>
        {/if}
    </div>
</div>