<script lang="ts">

    import { editComponentContents } from "$lib/state/editState.svelte";
    export let index: number;

    let showConfirm = false;

    function deleteComponent() {
        editComponentContents.update((contents) => {
            contents.splice(index, 1);
            return contents;
        });
    }
    function openMenu() {
        showConfirm = true;
        document.addEventListener('click', handleOutsideClick);
    }

    function handleOutsideClick(event: MouseEvent) {
        const menuElement = document.querySelector('.delete-component');
        if (menuElement && !menuElement.contains(event.target as Node)) {
            showConfirm = false;
        }
    }


</script>

<div class="delete-component">
    {#if showConfirm}
        <div class="flex flex-col items-center justify-center border-2 border-error-500 p-4 rounded-lg bg-error-50">
            <p class="text-error-900">Are you sure you want to delete this component?</p>
            <div class="flex space-x-2 mt-2">
                <button on:click={deleteComponent} class="btn preset-tonal-primary button-filled">Yes</button>
                <button on:click={() => showConfirm = false} class="btn preset-tonal-primary button-filled">No</button>
            </div>
        </div>
    {:else}
        <button 
        on:click={(event) => { event.stopPropagation(); openMenu(); }}
        class="btn preset-tonal-primary button-filled">
            Delete
            </button>
    {/if}
</div>