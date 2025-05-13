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

    function handleSave() { //needs to make post to api
        editContent.set(false);
        let path = window.location.pathname.split("/");
        switch (path.length) {
            case 2: 
            //world
            console.log($editComponentContents);
            let updatedWorld = $world;
            if (updatedWorld) {
                updatedWorld.content = $editComponentContents;
                world.set(updatedWorld);
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
            }
            case 4: 
            //entry
            const entryId = decodeURIComponent(path[path.length - 1]);
            const updatedEntry = $entry;
            if (updatedEntry) {
                updatedEntry.content = $editComponentContents;
                entry.set(updatedEntry);
            }
        }
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