<script lang="ts">
    import { TagsInput } from '@skeletonlabs/skeleton-svelte';
    import IconDelete from '@lucide/svelte/icons/circle-x';
    import { clickOutside } from './clickOutside';
    import { createCollection } from '$lib/scripts/world';
    export let closeMenu: () => void;

    let item = '';
    if (window.location.pathname.split("/").length == 4) {
        item = 'Entry'
    } else if (window.location.pathname.split("/").length == 3){
        item = 'Collection'
    } else {
        item = 'World'
    }

    const handleConfirm = () => {
        closeMenu();
    };

</script>
<div class="delete-item-form bg-surface-100-900 w-[25%]"
    use:clickOutside={closeMenu}>
    <h2 class="text-3xl">
        Delete {item}?
    </h2>
    <h3> 
        Deleting a {item} will permanently delete its content and all sub-documents related to it. Are you sure?
    </h3>
    <button onclick={() => {
        closeMenu();
        }}>
        yes
    </button>
    <button onclick={() => {
        handleConfirm();
    }}>
        no
    </button>
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