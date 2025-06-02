<script lang="ts">
    import { Plus } from 'lucide-svelte';
    import AddComponentMenu from './addComponentMenu.svelte';
    export let index;

    let menuVisible = false;
    let menuPosition = { x: 0, y: 0 };

    function openMenu(event: MouseEvent) {
        menuPosition = { x: event.pageX, y: event.pageY };
        menuVisible = true;

        // Add a click listener to detect clicks outside the menu
        document.addEventListener('click', handleOutsideClick);
    }

    function closeMenu() {
        menuVisible = false;

        // Remove the click listener when the menu is closed
        document.removeEventListener('click', handleOutsideClick);
    }

    function handleOutsideClick(event: MouseEvent) {
        const menuElement = document.querySelector('.add-component-menu');
        if (menuElement && !menuElement.contains(event.target as Node)) {
            closeMenu();
        }
    }
</script>

<button
    on:click={(event) => { event.stopPropagation(); openMenu(event); }}
    type="button"
    class="btn-icon variant-filled preset-tonal-primary w-full box-border mb-2 mt-2"
>
    <Plus />
</button>

{#if menuVisible}
    <AddComponentMenu
        {index}
        {menuPosition}
        {closeMenu}
        on:closeMenu={closeMenu}
    />
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