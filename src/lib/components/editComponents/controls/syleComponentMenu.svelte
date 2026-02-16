<script lang="ts">
    import { editComponentContents } from '$lib/state/editState.svelte';
    import ColorPicker from 'svelte-awesome-color-picker';
    import { get } from 'svelte/store';
    export let index: number | undefined;
    export let menuPosition = { x: 0, y: 0 };
    export let closeMenu: () => void;
    type SubOption = Record<string, string[]>;
    type MenuOptions = Record<string, SubOption[]>;

    const menuOptions: MenuOptions = {
        'Text': [{'Size': ['h1', 'h2']}, {'Color': []}, {'Font': ['Bold', 'Italic']}, {'Font Variant': ['Cinzel', 'Cormorant Garamond', 'Uncial Antiqua']}],
       'Background': [{'Color': []}, {'Border': []}, {'Rounding': []}],
        'TBA': [{"Option 2.1": []}, {"Option 2.2": []}, {"Option 2.3": []}],
    };

    let selectedCategory: keyof typeof menuOptions = Object.keys(menuOptions)[0] as keyof typeof menuOptions;
    let selectedSubCategory: number | null = null;
    let selectedOption: string | null = null;

    function selectCategory(category: keyof typeof menuOptions) {
        selectedCategory = category;
        selectedSubCategory = null;
    }

    function selectSubCategory(subCategoryIndex: number) {
        selectedSubCategory = subCategoryIndex;
        if (menuOptions[selectedCategory][subCategoryIndex]) {
            const subOptionKey = Object.keys(menuOptions[selectedCategory][subCategoryIndex])[0];
            if (editComponentContents && index !== undefined) {
                const component = get(editComponentContents)[index];
                console.log(component);
                console.log(selectedCategory);
                console.log(component.style[selectedCategory.toLowerCase()]);
                if (component.style && subOptionKey.toLowerCase() in component.style[selectedCategory.toLowerCase()]) {
                    // console.log(component.style[selectedCategory][subOptionKey]);
                    selectedOption = component.style[selectedCategory.toLowerCase()][subOptionKey.toLowerCase()] || null;
                }
            }
        }
    }

    function handleOptionSelect(key: string, value: string) {
        if (index === undefined) return;
        selectedOption = value;
        console.log(value);
        editComponentContents.update((contents) => {
            const component = contents[index];
            if (!component.style) component.style = {};
            if (!component.style[selectedCategory.toLowerCase()]) component.style[selectedCategory.toLowerCase()] = {};
            component.style[selectedCategory.toLowerCase()][key.toLowerCase()] = value;
            return contents;
        });
    }

    function handleColorPick(event: CustomEvent<string>) {
        if (index === undefined) return;
        const color  = event.detail;
        editComponentContents.update((contents) => {
            const component = contents[index];
            if (!component.style) component.style = {};
            component.style['Color'] = color;
            return contents;
        });
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
                    ${selectedCategory === category ? 'bg-surface-50 text-primary-surface-contrast-100 font-medium' : 'text-surface-contrast-500'}`}
                onclick={() => selectCategory(category as keyof typeof menuOptions)}
            >
                {category}
            </button>
        {/each}
        <button
            type="button"
            class={`text-left px-3 py-2 rounded-md transition-colors text-error-500
                    hover:bg-error-50 hover:text-error-contrast-50
                    focus:outline-none focus:bg-error-50 'text-error-contrast-500'`}
            onclick={() => {
                if (index === undefined) return;
                editComponentContents.update((contents) => {
                const component = contents[index];
                if (component.style) {
                    delete component.style;
                }
                return contents;
            });
            closeMenu();
            }}
            >Reset Styles</button>
    </div>
    <!-- Middle Column (Options) -->
    <div class="w-auto flex flex-col pl-2 border-r border-primary-200 pr-2 text-surface">
        {#if selectedCategory}
            {#each menuOptions[selectedCategory] as option, i}
                <button
                    type="button"
                    class={`text-left px-3 py-2 rounded-md transition-colors
                    hover:bg-surface-50 hover:text-primary-contrast-50
                    focus:outline-none focus:bg-surface-50
                    ${ selectedSubCategory === i ? 'bg-surface-50 text-primary-surface-contrast-100 font-medium' : 'text-surface-contrast-500'}`}
                    onclick={() => selectSubCategory(i)}
                    >
                    {Object.keys(option)[0]}
                </button>
            {/each}
        {:else}
            <div class="px-3 py-2 text-gray-500">Select a category</div>
        {/if}
    </div>
    {#if selectedSubCategory !== null}
    <div class="w-auto flex flex-col pl-2 text-surface">
        {#each Object.entries(menuOptions[selectedCategory][selectedSubCategory]) as [key, values]}
            {#if values.length}
                {#each values as val}
                    <button
                        type="button"
                        class={`text-left px-3 py-2 rounded-md transition-colors
                    hover:bg-surface-50 hover:text-primary-contrast-50
                    focus:outline-none focus:bg-surface-50
                    ${ selectedOption == val ? 'bg-surface-50 text-primary-surface-contrast-100 font-medium' : 'text-surface-contrast-500'}`}
                        onclick={() => handleOptionSelect(key, val)}
                        >
                        {val}
                    </button>
                {/each}
                {:else if key === 'Color'}
                <div class="picker-wrapper pt-2 pr-2">
                <ColorPicker isDialog={false} isDark
                    onInput={(e) => {
                        if (e.hex){
                            handleOptionSelect('Color', e.hex);
                        }
                    }} />
                 </div>
            {/if}
        {/each}
    </div>
    {/if}
</div>

