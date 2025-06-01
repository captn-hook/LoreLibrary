<script lang="ts">
    import {
        FloatingArrow,
        arrow,
        autoUpdate,
        flip,
        offset,
        useClick,
        useDismiss,
        useFloating,
        useInteractions,
        useRole,
    } from "@skeletonlabs/floating-ui-svelte";
    import { fade } from "svelte/transition";
    import { showStyleControls, editContent, editComponentContents } from "$lib/state/editState.svelte";
    import {world, collections, entry} from "$lib/state/worldState.svelte";
    import type { World } from "$lib/types/world";
    import type { Collection } from "$lib/types/collection";
    import type { Entry } from "$lib/types/entry";
    import { updateWorld, updateCollection, updateEntry } from "$lib/scripts/world";
    
    // State
    let open = $state(false);
    let elemArrow: HTMLElement | null = $state(null);
    
    // Use Floating
    const floating = useFloating({
        whileElementsMounted: autoUpdate,
        get open() {
            return open;
        },
        onOpenChange: (v) => {
            open = v;
        },
        placement: "top",
        get middleware() {
            return [offset(10), flip(), elemArrow && arrow({ element: elemArrow })];
        },
    });
    
    // Interactions
    const role = useRole(floating.context);
    const click = useClick(floating.context);
    const dismiss = useDismiss(floating.context);
    const interactions = useInteractions([role, click, dismiss]);

    
function cleanContents() { //bullet and number lists are assigned ids while editing, this removes them to save some space in db
    $editComponentContents = $editComponentContents.map(item => {
        function removeIds(content: any[]): any[] {
            if (!Array.isArray(content)) {
                console.warn("Invalid content:", content);
                return []; // Return an empty array if content is not valid
            }

            return content.map((subItem: any) => {
                if (subItem.subItems && Array.isArray(subItem.subItems)) {
                    subItem.subItems = removeIds(subItem.subItems); // Recursively clean subItems
                }
                const { id, ...rest } = subItem; // Remove the id property
                return rest;
            });
        }

        if (item.key === 'bulletList' || item.key === 'numberedList') {
            if (Array.isArray(item.value)) {
                item.value = removeIds(item.value); // Apply removeIds to the value array
            } else {
                console.warn("item.value is not an array:", item.value);
            }
            const { id, ...rest } = item; // Remove the id property from the top-level item
            return rest;
        }
        return item; // Return the updated item
    });
}
    function handleSave() { //needs to make post to api
        editContent.set(false);
        cleanContents();
        let path = window.location.pathname.split("/");
        switch (path.length) {
            case 2: 
            //world
            let updatedWorld = $world;
            if (updatedWorld) {
                updatedWorld.content = $editComponentContents;
                world.set(updatedWorld);
                console.log("Updated world:", updatedWorld);
                updateWorld();
            }
            case 3: 
            //collection
            const collectionId = decodeURIComponent(path[path.length - 1]);
            const updatedCollection = $collections?.find(c => c.id === collectionId);
            if (updatedCollection) {
                const updatedCollections = $collections?.map(c =>
                    c.id === collectionId ? { ...c, content: $editComponentContents } : c
                );
                collections.set(updatedCollections || []);
                // updateCollection(collectionId);
            }
            case 4: 
            //entry
            const entryId = decodeURIComponent(path[path.length - 1]);
            const updatedEntry = $entry;
            if (updatedEntry) {
                updatedEntry.content = $editComponentContents;
                entry.set(updatedEntry);
                // updateEntry();
            }
        }
        editComponentContents.set([]);
    }
</script>
    
<nav class="flex justify-between items-center mx-3 mb-1 mt-2 w-full">
    <!-- Left: Save/Cancel -->
    <div class="flex gap-2">
        {#if $editContent}
            <button
                class="btn preset-tonal-primary border-[1px] border-surface-200-800 card-hover px-2 rounded-md"
                onclick={handleSave}
            >
                Save
            </button>
            <button
                class="btn preset-tonal-primary border-[1px] border-surface-200-800 card-hover px-2 rounded-md"
                onclick={() => editContent.set(false)}
            >
                Cancel
            </button>
        {/if}
    </div>

    <!-- Right: Edit Options -->
    <div class="flex ml-auto">
        <button
            bind:this={floating.elements.reference}
            {...interactions.getReferenceProps()}
            class="btn preset-tonal-primary border-[1px] border-surface-200-800 card-hover px-2 rounded-md"
        >
            Edit Options
        </button>
    </div>
    <!-- Floating Element -->
    {#if open}
        <div
            bind:this={floating.elements.floating}
            style={floating.floatingStyles}
            {...interactions.getFloatingProps()}
            class="floating popover-neutral"
            transition:fade={{ duration: 200 }}
        >
            <ul class="menu preset-tonal-primary rounded-md">
                <li>
                    <button class="menu-item rounded-md" onclick={() => {
                        showStyleControls.set(false);
                        editContent.set(true);
                        open = false;}                        
                    }>
                        Edit Content
                    </button>
                </li>
                <li>
                    <button class="menu-item preset-tonal-primary rounded-md" onclick={() => {
                        showStyleControls.set(true);
                        editContent.set(false);
                        open = false;}
                    }>
                        Edit Theme
                    </button>
                </li>
            </ul>
            <FloatingArrow bind:ref={elemArrow} context={floating.context} fill="#575969" />
        </div>
    {/if}
</nav>

<style>
    .menu {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .menu-item {
        background: none;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        text-align: left;
        width: 100%;
    }
    .menu-item:hover {
        background-color: #f0f0f0;
    }
</style>