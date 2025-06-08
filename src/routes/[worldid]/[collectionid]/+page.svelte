<script lang="ts">
    export let data;
    import {getCollection} from "$lib/scripts/world";
    import Navbar from "$lib/components/navigationComponents/navbar.svelte";
    import { onMount } from "svelte";
    import Router from "$lib/components/navigationComponents/router.svelte";
    import {collections} from "$lib/state/worldState.svelte";
    import {Collection} from "$lib/types/collection";
    import {editContent, showCreateCollection} from "$lib/state/editState.svelte";
    import Content from "$lib/components/content.svelte";
    import EditableContent from "$lib/components/editComponents/editableContent.svelte";
    import {updateSettingsFromCurrentStyles} from "$lib/scripts/generator/generate-css.js";
    import CreateCollectionForm from "$lib/components/editComponents/addDocumentComponents/createCollectionForm.svelte";


    let collection: Collection;
    onMount(async () => {
        if (!$collections?.some(collection => collection.name === data.collectionid)) {
            await getCollection(data.worldid, data.collectionid);
        }
        collections.subscribe(value => {
        collection = value?.find(collection => collection.name === data.collectionid) ?? {} as Collection;
        if (collection?.styling && collection.styling != '') {
            if (collection.styling.length > 20) { // custom
                const styleTag = document.createElement('style');
			    styleTag.textContent = collection.styling;
			    document.head.appendChild(styleTag);
                document.documentElement.setAttribute('data-theme', 'custom');

            }else {
            document.documentElement.setAttribute('data-theme', collection.styling);
            }
            updateSettingsFromCurrentStyles();
        }
    });
    });
    function getNavItems(collection: Collection): {name: string, href: string}[] {
        let navItems : {name: string, href: string}[] = [];
        collection?.collections.forEach(c => {
            navItems.push({name: c, href: `/${data.worldid}/${c}`});
        });
        collection?.entries.forEach(e => {
            navItems.push({name: e, href: `/${data.worldid}/${data.collectionid}/${e}`});
        });
        return navItems;
    }
</script>

<div>
    <Navbar navItems={getNavItems(collection)} />
    <Router/>
    <div class="flex flex-row">
        <div class="flex-1 ml-3">
            <h1 class="text-4xl font-bold text-primary mb-4">{collection?.name}</h1>
            {#if $editContent == false}
            <Content content={collection?.content ?? []}/>
            {:else}
            <EditableContent content={collection?.content ?? []}/>
            {/if}
        </div>
        <div class="flex-none">
            <img class="relative m-4" src={collection?.image} alt=""/>
        </div>
    </div>
{#if $showCreateCollection}
<CreateCollectionForm closeMenu={() => showCreateCollection.set(false)}/>
{/if}
</div>
