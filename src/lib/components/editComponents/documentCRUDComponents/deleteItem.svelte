<script lang="ts">
    import { TagsInput } from '@skeletonlabs/skeleton-svelte';
    import IconDelete from '@lucide/svelte/icons/circle-x';
    import { clickOutside } from './clickOutside';
    import { createCollection, deleteWorld, deleteCollection, deleteEntry } from '$lib/scripts/world';
    import { goto } from '$app/navigation';
    export let closeMenu: () => void;

    let item = '';
    if (window.location.pathname.split("/").length == 4) {
        item = 'Entry'
    } else if (window.location.pathname.split("/").length == 3){
        item = 'Collection'
    } else {
        item = 'World'
    }

    const handleConfirm = async () => {
        if (item == 'World'){
            await deleteWorld();
        } else if (item == 'Collection'){
            await deleteCollection();
        } else {
            await deleteEntry();
        }
        closeMenu();
        let path = window.location.pathname.split("/")
        path.pop();
        if (path[-1] == path[-2]){
            path.pop();
        }
        if (item == 'Collection'){
        }
        goto(path.join('/'))
    };

</script>
<div class="delete-item-form bg-surface-100-900 w-[25%]"
    use:clickOutside={closeMenu}>
    <h2 class="text-3xl">
        Delete {item}?
    </h2>
    <h3> 
        Deleting {#if item == 'Entry'} an {:else} a {/if} {item.toLocaleLowerCase()} will permanently delete its content and all sub-documents related to it. Are you sure?
    </h3>
    <div class="form-actions flex justify-end space-x-2">
        <button class="btn btn-primary"onclick={() => {closeMenu();}}>Cancel</button>
        <button class="btn btn-secondary" onclick={() => {handleConfirm();}}>Confirm</button>
    </div>
</div>

<style>
    .delete-item-form {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        z-index: 1000;
    }

    /* Optional: Add a backdrop */
    :global(body) {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>