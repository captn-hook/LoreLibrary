<script lang="ts">
    export let data;

    import {getEntry} from "$lib/scripts/world";
    import Router from "$lib/components/navigationComponents/router.svelte";
    import Content from "$lib/components/content.svelte";
    import { editContent } from "$lib/state/editState.svelte";
    import EditableContent from "$lib/components/editComponents/editableContent.svelte";
    import { onDestroy, onMount } from "svelte";
    import {entry as entryContext} from "$lib/state/worldState.svelte";
    import { updateSettingsFromCurrentStyles } from "$lib/scripts/generator/generate-css.js";


    let editContentValue;
    const unsubscribe = editContent.subscribe(value => {
        editContentValue = value;
    });
    
    onDestroy(() => {
        unsubscribe();
    });

    $: if (typeof window !== 'undefined' && $entryContext?.name !== data.entryid) {
        getEntry(data.worldid, data.collectionid, data.entryid);
    }
    $: if (
        typeof window !== 'undefined' &&
        $entryContext?.styling &&
        $entryContext.styling !== ''
    ) {
        // Remove all <style> tags that start with '[data-theme="custom"]'
        document.querySelectorAll('style').forEach(tag => {
            if (tag.textContent?.trim().startsWith('[data-theme="custom"]')) {
                tag.remove();
                }
            });
        if ($entryContext.styling.length > 20) {
            const styleTag = document.createElement('style');
            styleTag.textContent = $entryContext.styling;
            document.head.appendChild(styleTag);
            document.documentElement.setAttribute('data-theme', 'custom');
        } else if ($entryContext.styling !== '') {
            document.documentElement.setAttribute('data-theme', $entryContext.styling);
        } else {
            document.documentElement.setAttribute('data-theme', 'pine'); //default if parent style was not passed
        }
        updateSettingsFromCurrentStyles();
    }
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