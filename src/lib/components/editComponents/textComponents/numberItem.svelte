<script lang="ts">
    import NumberItem from './numberItem.svelte';

    export let item: { id: string; text: string; subItems?: any[] };
    export let addSubItem: (parent: any) => void;
    export let removeSubItem: (parent: any, subId: string) => void;
    export let removeItem: (item: { id: string }) => void;
    export let updateItem: (updatedItem: { id: string; text: string; subItems?: any[] }) => void;

    const handleRemoveItem = () => {
        removeItem(item);
    };

    const handleInput = (e: Event) => {
        const newText = (e.target as HTMLInputElement).value;
        updateItem({ ...item, text: newText });
    };
</script>

<li class="my-4 gap-2 text-surface">
    <div class="flex items-center gap-2">
        <input
            type="text"
            value={item.text}
            on:input={handleInput}
            class="input input-ghost w-full text-surface bg-surface border-primary-200 border-2 max-w-[15%]"
            placeholder="Enter text"
        />
        <button on:click={() => addSubItem(item)} class="btn btn-primary preset-tonal-primary">
            Add Sub-Item
        </button>
        <button on:click={handleRemoveItem} class="btn btn-error preset-tonal-error">
            Remove
        </button>
    </div>

    {#if item.subItems?.length}
        <ol class="list-decimal pl-6 border-l border-muted ml-2">
            {#each item.subItems as subItem (subItem.id)}
                <NumberItem
                    item={subItem}
                    {addSubItem}
                    {removeSubItem}
                    removeItem={() => removeSubItem(item, subItem.id)}
                    updateItem={(updatedSub) => {
                        subItem.text = updatedSub.text;
                        updateItem({ ...item, subItems: [...(item.subItems || [])] });
                    }}
                />
            {/each}
        </ol>
    {/if}
</li>