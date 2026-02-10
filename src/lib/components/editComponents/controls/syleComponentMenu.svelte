<script lang="ts">
    import { editComponentContents } from '$lib/state/editState.svelte';
    import ColorPicker from 'svelte-awesome-color-picker';
    export let index: number | undefined;
    export let menuPosition = { x: 0, y: 0 };
    export let closeMenu: () => void;
    let color = '#ff0000';
    type SubOption = Record<string, string[]>;
    type MenuOptions = Record<string, SubOption[]>;

    const menuOptions: MenuOptions = {
        'Text': [{'Size': ['h1', 'h2']}, {'Color': []}, {'Font': ['Bold', 'Italic']}, {'Font Variant': ['Serif', 'Sans-serif']}],
       'Background': [{'Color': []}, {'Border': []}, {'Rounding': []}],
        'TBA': [{"Option 2.1": []}, {"Option 2.2": []}, {"Option 2.3": []}],
    };

    let selectedCategory: keyof typeof menuOptions = Object.keys(menuOptions)[0] as keyof typeof menuOptions;
    let selectedSubCategory: number | null = null;

    function selectCategory(category: keyof typeof menuOptions) {
        selectedCategory = category;
        selectedSubCategory = null;
    }

    function selectSubCategory(subCategoryIndex: number) {
        selectedSubCategory = subCategoryIndex;
        if (menuOptions[selectedCategory][subCategoryIndex]) {
            const subOptionKey = Object.keys(menuOptions[selectedCategory][subCategoryIndex])[0];
            const subOptionValues = menuOptions[selectedCategory][subCategoryIndex][subOptionKey];
            if (subOptionValues.length === 0) {
                
            }
        }
    }

</script>

<div
    class="add-component-menu absolute z-50 border border-primary-200 border-2 bg-surface-950 text-surface rounded-xl shadow-lg inline-flex"
    style="top: {menuPosition.y}px; left: {menuPosition.x}px;"
>
    <!-- Left Column (Categories) -->
    <div class="w-auto flex flex-col border-r border-primary-200 pr-2">
        {#each Object.keys(menuOptions) as category}
            <button
                type="button"
                class={`text-left px-3 py-2 rounded-md transition-colors
                    hover:bg-surface-50 hover:text-primary-contrast-50
                    focus:outline-none focus:bg-surface-50
                    ${selectedCategory === category ? 'bg-surface-100 text-primary-surface-contrast-100 font-medium' : 'text-surface-contrast-500'}`}
                on:click={() => selectCategory(category as keyof typeof menuOptions)}
            >
                {category}
            </button>
        {/each}
    </div>
    <!-- Middle Column (Options) -->
    <div class="w-auto flex flex-col pl-2 border-r border-primary-200 pr-2">
        {#if selectedCategory}
            {#each menuOptions[selectedCategory] as option, i}
                <button
                    type="button"
                    class="text-left px-3 py-2  rounded-md text-surface-contrast-500 transition-colors hover:bg-surface-50 hover:text-primary-contrast-50 focus:bg-gray-200"
                    on:click={() => selectSubCategory(i)}
                    >
                    {Object.keys(option)[0]}
                </button>
            {/each}
        {:else}
            <div class="px-3 py-2 text-gray-500">Select a category</div>
        {/if}
    </div>
    {#if selectedSubCategory !== null}
    <div class="w-auto flex flex-col pl-2 ">
        {#each Object.entries(menuOptions[selectedCategory][selectedSubCategory]) as [key, values]}
            {#if values.length}
                {#each values as val}
                    <button
                        type="button"
                        class="text-left px-3 py-2 rounded-md text-surface-contrast-500 transition-colors hover:bg-surface-50 hover:text-primary-contrast-50 focus:bg-gray-200"
                        >
                        {val}
                    </button>
                {/each}
                {:else if key === 'Color'}
                <div class="picker-wrapper pt-2 pr-2">
                 <ColorPicker isDialog={false} isDark />
                 </div>
            {/if}
        {/each}
    </div>
    {/if}
</div>

