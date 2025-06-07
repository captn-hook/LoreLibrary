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
  import { updateSettingsFromCurrentStyles } from "$lib/scripts/generator/generate-css.js";


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
<Navbar navItems={getNavItems($worldContext?.collections)} />
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
            <img class="relative m-4" src={$worldContext?.img_url} alt=""/>
        </div>
    </div>
</div>
    