<script lang="ts">
    import { editComponentContents } from '$lib/state/editState.svelte';
    import MiniPalletePicker from './miniPalletePicker.svelte';
    import {getMenuOptions} from "$lib/scripts/componentStyling";
    import ColorPicker from 'svelte-awesome-color-picker';
    import { get } from 'svelte/store';
    export let index: number | undefined;
    export let menuPosition = { x: 0, y: 0 };
    export let type: string;
    export let closeMenu: () => void;

    const menuOptions = getMenuOptions(type); 
    let selectedCategory: keyof typeof menuOptions = Object.keys(menuOptions)[0] as keyof typeof menuOptions;
    let selectedSubCategory: number | null = null;
    let selectedOption: string | string[] | null = null;
    let miniSelectedColor: [string, string] | undefined = undefined;

    function selectCategory(category: keyof typeof menuOptions) {
        selectedCategory = category;
        if (menuOptions[category].length == 1){
            selectSubCategory(0);
        } else {
            selectedSubCategory = null;
        }
 
    }

    function selectSubCategory(subCategoryIndex: number) {
        selectedSubCategory = subCategoryIndex;
        if (menuOptions[selectedCategory][subCategoryIndex]) {
            const subOptionKey = Object.keys(menuOptions[selectedCategory][subCategoryIndex])[0];
            if (editComponentContents && index !== undefined) {
                const component = get(editComponentContents)[index];
                console.log(component);
                if (component.style && component.style[selectedCategory.toLowerCase()] && subOptionKey.toLowerCase() in component.style[selectedCategory.toLowerCase()]) {
                    selectedOption = component.style[selectedCategory.toLowerCase()][subOptionKey.toLowerCase()] || null;
                    if (Array.isArray(selectedOption) && selectedOption.length === 2) {
                        miniSelectedColor = selectedOption as [string, string];
                    } else {
                        miniSelectedColor = undefined;
                    }
                } else {
                    selectedOption = null;
                    miniSelectedColor = undefined; //this is a lil weird, but it works...
                }
            }
        }
    }

    function handleOptionSelect(key: string, value: string | string[]) {
        console.log("Selected option:", key, value);
        if (index === undefined) return;
        // keep selectedOption in sync with chosen value (string or array)
        selectedOption = value;
        // sync miniSelectedColor if the value is a tuple
        if (Array.isArray(value) && value.length === 2) {
            miniSelectedColor = value as [string, string];
        } else {
            miniSelectedColor = undefined;
        }
        editComponentContents.update((contents) => {
            const component = contents[index];
            if (!component.style) component.style = {};
            if (!component.style[selectedCategory.toLowerCase()]) component.style[selectedCategory.toLowerCase()] = {};
            component.style[selectedCategory.toLowerCase()][key.toLowerCase()] = value;
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
                <div class="pt-2 pr-2">
                    <!-- bind to the identifier miniSelectedColor and provide an adapter for selectOption so the picker value is stored under the correct key -->
                    <MiniPalletePicker on:change={(e) => {handleOptionSelect(key, e.detail)}} bind:selectedColor={miniSelectedColor}/>
                    <ColorPicker
                        onInput={(e) => {
                            let timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                if (!e.hex) return;
                                handleOptionSelect(key, e.hex);
                            }, 50);}}/>
                </div>
            {/if}
        {/each}
    </div>
    {/if}
</div>

