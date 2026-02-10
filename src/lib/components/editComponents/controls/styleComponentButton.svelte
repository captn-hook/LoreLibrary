<script lang="ts">
    export let index: number;
    export let disabledOwner: string | null = null;

    import StyleComponentMenu from './syleComponentMenu.svelte';
    let menuVisible = false;
    let menuPosition = { x: 0, y: 0 };

    function openMenu(event: MouseEvent) {
        menuPosition = { x: event.pageX, y: event.pageY };
        menuVisible = true;
        disabledOwner = 'style';
        document.addEventListener('click', handleOutsideClick);
    }

    function closeMenu() {
        menuVisible = false;
        if (disabledOwner === 'style') disabledOwner = null;
        document.removeEventListener('click', handleOutsideClick);
    }

    function handleOutsideClick(event: MouseEvent) {
        const menuElement = document.querySelector('.add-component-menu');
        if (menuElement && !menuElement.contains(event.target as Node)) {
            closeMenu();
        }
    }
</script>

<div class="style-component">
    <button 
    disabled={disabledOwner === 'delete'}
    class="btn preset-tonal-primary button-filled w-full"
     on:click={(event) => { event.stopPropagation(); openMenu(event); }}>
        Style
    </button>
</div>

{#if menuVisible}
    <StyleComponentMenu
        {index}
        {menuPosition}
        {closeMenu}
        on:closeMenu={closeMenu}
    />
{/if}