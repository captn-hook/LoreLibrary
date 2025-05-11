<script lang="ts">
    import NumberItem from './numberItem.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';

    export let items: { id: string; text: string; subItems?: any[] }[] = [];
    export let index: number;
     function syncToStore() {
		editComponentContents.update((contents) => {
			contents[index] = {key: "number", value: items};
			return contents;
		});
	}

	const addItem = () => {
		items = [...items, { id: crypto.randomUUID(), text: '', subItems: [] }];
		syncToStore();
	};

	const removeItem = (item: { id: string }) => {
		items = items.filter((number) => number.id !== item.id);
		syncToStore();
	};

	function addSubItem(parent: { subItems?: any[] }) {
		parent.subItems = parent.subItems || [];
		parent.subItems.push({ id: crypto.randomUUID(), text: '', subItems: [] });
		items = [...items];
		syncToStore();
	}

	function removeSubItem(parent: { subItems?: any[] }, subId: string) {
		if (parent.subItems) {
			parent.subItems = parent.subItems.filter((b) => b.id !== subId);
			items = [...items];
			syncToStore();
		}
	}

	const updateItem = (idx: number, updatedItem: { id: string; text: string; subItems?: any[] }) => {
		items[idx] = updatedItem;
		items = [...items];
		syncToStore();
	};
</script>

<ol class="list-decimal pl-6 border-l border-muted ml-2">
    {#each items as number, i (number.id)}
        <NumberItem
            item={number}
            {addSubItem}
            {removeSubItem}
            removeItem={removeItem}
            updateItem={(updatedItem) => updateItem(i, updatedItem)}
        />
    {/each}
</ol>

<button on:click={addItem} class="btn preset-tonal-secondary ml-2 button-filled">Add Item</button>
