<script lang="ts">
    import { editComponentContents } from '$lib/state/editState.svelte';
  import { Component } from 'lucide-svelte';

    export let index: number | undefined;
    export let menuVisible = false;
    export let menuPosition = { x: 0, y: 0 };

    const menuOptions = {
        'Text': ['Header', 'Paragraph', 'Markdown', 'HTML', 'Number List', 'Bullet List'],
        'TBA': ["Option 2.1", "Option 2.2", "Option 2.3"],
    };

    let selectedCategory: keyof typeof menuOptions = Object.keys(menuOptions)[0] as keyof typeof menuOptions;

    function selectCategory(category: keyof typeof menuOptions) {
        selectedCategory = category;
    }

    function closeMenu() {
        menuVisible = false;
    }

    function addComponent(option: string){
        console.log(option)
        let component = {};
        if (index !== undefined) {
            switch (option){
            case 'Header':
                component = { key: "title", value: "" };
                break;
            case 'Paragraph':
                component = { key: "text", value: "" };
                break;
            case 'Markdown':
                component =  { key: "md", value: "" };
                break;
            case 'HTML':
                component =  { key: "html", value: "" };
                break;
            case 'Number List':
                component = { key: "numberedList", value: [{text: 'HI',id: 0, subItems: []}] };
                break;
            case 'Bullet List':
                component = { key: "bulletList", value: [{text: '',id: 0, subBullets: []}] };
                break;
            }  
            editComponentContents.update((contents) => {
                contents.splice(index, 0, component);
                return contents;
            });
    console.log('Component added:', component);
    closeMenu();
        }
    }
</script>

<style>
    .menu {
        position: absolute;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 5px;
        padding: 10px;
        z-index: 1000;
        display: flex;
    }

    .menu-left {
        width: 40%;
        border-right: 1px solid var(--color-border);
        padding-right: 10px;
    }

    .menu-right {
        width: 60%;
        padding-left: 10px;
    }

    .menu-item {
        padding: 5px 10px;
        cursor: pointer;
        color: var(--color-text);
    }

</style>
{#if menuVisible}

<div
  class="absolute z-50 border border-primary-200 border-2 bg-surface-950 text-surface rounded-xl shadow-lg flex w-80"
  style="top: {menuPosition.y}px; left: {menuPosition.x}px;"
>
  <!-- Left Column (Categories) -->
  <div class="w-2/5 border-r border-primary-200 pr-2">
    {#each Object.keys(menuOptions) as (keyof typeof menuOptions)[] as category}
      <button
        type="button"
        class={`w-full text-left px-3 py-2 rounded-md transition-colors
          hover:bg-surface-50 hover:text-primary-contrast-50
          focus:outline-none focus:bg-surface-50
          ${selectedCategory === category ? 'bg-surface-100 text-primary-contrast-50 font-medium' : 'text-surface'}`}
        on:click={() => selectCategory(category)}
      >
        {category}
      </button>
    {/each}
  </div>

  <!-- Right Column (Options) -->
  <div class="w-3/5 pl-2">
    {#if selectedCategory}
      {#each menuOptions[selectedCategory] as option}
        <button
          type="button"
          class="w-full text-left px-3 py-2 rounded-md text-surface transition-colors hover:bg-surface-50 hover:text-primary-contrast-50 focus:bg-gray-200"
          on:click={() => addComponent(option)}
        >
          {option}
        </button>
      {/each}
    {:else}
      <div class="px-3 py-2 text-gray-500">Select a category</div>
    {/if}
  </div>
</div>
{/if}