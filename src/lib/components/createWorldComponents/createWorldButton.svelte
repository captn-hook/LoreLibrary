<script lang="ts">
    import CreateWorldForm from './createWorldForm.svelte';
    let menuVisible = false;

    function openMenu(event: MouseEvent) {
        menuVisible = true;
    }

    function closeMenu() {
        menuVisible = false;
    }
</script>

<button
    on:click={(event) => { event.stopImmediatePropagation(); openMenu(event); }}
    class="btn preset-tonal-primary"
>
    Create World
</button>

{#if menuVisible}
    <CreateWorldForm
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