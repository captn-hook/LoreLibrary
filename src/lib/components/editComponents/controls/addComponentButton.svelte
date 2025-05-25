<script lang="ts">
import { Plus } from 'lucide-svelte';
import AddComponentMenu from './addComponentMenu.svelte';
export let index;

    let menuVisible = false;
    let menuPosition = { x: 0, y: 0 };

    function openMenu(event: MouseEvent) {
        menuPosition = { x: event.clientX, y: event.clientY };
        menuVisible = true;
        console.log('Menu opened at:', menuPosition);
    }

    function closeMenu() {
        menuVisible = false;
    }
</script>
<button
    on:click={openMenu}
    type="button"
    class="btn-icon variant-filled bg-surface-500 w-full box-border"
>
    <Plus />
</button>
{#if index !== undefined}
    <AddComponentMenu {index} {menuVisible} {menuPosition}/>
{/if}

<style>
/* Ensure the button respects the parent's width */
button {
    max-width: 100%; /* Prevent the button from exceeding the parent's width */
    box-sizing: border-box; /* Include padding and border in the width calculation */
    padding-top: 0.75rem; /* Adjust vertical padding (example: 0.75rem) */
    padding-bottom: 0.75rem; /* Adjust vertical padding (example: 0.75rem) */
}
</style>