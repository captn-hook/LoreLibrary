<script lang="ts">
    export let data;

    import {getWorld} from "$lib/scripts/world";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    import Router from "$lib/components/navigationComponents/router.svelte";
    import Content from "$lib/components/content.svelte";
    import { editContent, showCreateCollection, showCreateEntry } from "$lib/state/editState.svelte";
    import EditableContent from "$lib/components/editComponents/editableContent.svelte";
    import { onDestroy, onMount } from "svelte";
    import { world as worldContext} from "$lib/state/worldState.svelte";
    import { routerItems } from "$lib/state/routerState.svelte.js";
    import { RouterItem } from "$lib/types/routerItem";
  import {settingsColors} from "$lib/state/generator.svelte";
    import { updateSettingsFromCurrentStyles } from "$lib/scripts/generator/generate-css.js";
    import CreateCollectionForm from "$lib/components/editComponents/addDocumentComponents/createCollectionForm.svelte";
    import CreateEntryForm from "$lib/components/editComponents/addDocumentComponents/createEntryForm.svelte";
    import {World} from "$lib/types/world";


    let editContentValue;
    const unsubscribe = editContent.subscribe(value => {
        editContentValue = value;
    });

    onDestroy(() => {
        unsubscribe();
    });

    function getNavItems(world: World | null): {name: string, href: string}[] {
        let navItems : {name: string, href: string}[] = [];
        (world?.collections ?? []).forEach(c => {
            navItems.push({name: c, href: `/${data.worldid}/${c}`});
        });
        (world?.entries ?? []).forEach(e => {
            navItems.push({name: e, href: `/${data.worldid}/${data.worldid}/${e}`});
        });
        return navItems;
    }

    onMount(async () => {
        console.log(settingsColors);
        if ($worldContext?.name !== data.worldid) {
            await getWorld(data.worldid);
        }
        if ($worldContext?.styling) {
            if ($worldContext.styling.length > 20) { // custom
                const styleTag = document.createElement('style');
			    styleTag.textContent = $worldContext.styling;
			    document.head.appendChild(styleTag);
                document.documentElement.setAttribute('data-theme', 'custom');

            }else {
            document.documentElement.setAttribute('data-theme', $worldContext.styling);
            }
            updateSettingsFromCurrentStyles();
        }
        routerItems.set([new RouterItem(data.worldid, `/${data.worldid}`)]);
    })
</script>
<div>
<Navbar navItems={getNavItems($worldContext)} />
<Router/>
    <div class="flex flex-row">
        <div class="flex-1 ml-3">
            <h1 class="text-4xl font-bold text-primary mb-4">{$worldContext?.name}</h1>
            {#if $editContent == false}
            <Content content={$worldContext?.content ?? []}/>
            {:else}
            <EditableContent content={$worldContext?.content ?? []}/>
            {/if}
        </div>
        <div class="flex-none">
            <img class="relative m-4 z-0" src={$worldContext?.img_url} alt=""/>
        </div>
    </div>
{#if $showCreateCollection}
    <CreateCollectionForm closeMenu={() => showCreateCollection.set(false)}/>
{/if}
{#if $showCreateEntry}
    <CreateEntryForm closeMenu={() => showCreateEntry.set(false)} />
{/if}
</div>
    