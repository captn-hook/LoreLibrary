<script lang="ts">
    import BulletItem from './bulletItem.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';

    export let items: { id: string; text: string; subItems?: any[] }[] = [];
    export let index: number;
     function syncToStore() {
		editComponentContents.update((contents) => {
			contents[index] = {key: "bulletList", value: items};
			return contents;
		});
	}

	const addItem = () => {
		items = [...items, { id: crypto.randomUUID(), text: '', subItems: [] }];
		syncToStore();
	};

	const removeItem = (item: { id: string }) => {
		items = items.filter((bullet) => bullet.id !== item.id);
		syncToStore();
	};

	function addsubItem(parent: { subItems?: any[] }) {
		parent.subItems = parent.subItems || [];
		parent.subItems.push({ id: crypto.randomUUID(), text: '', subItems: [] });
		items = [...items];
		syncToStore();
	}

	function removesubItem(parent: { subItems?: any[] }, subId: string) {
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

<ul>
    {#each items as bullet, i (bullet.id)}
        <BulletItem
            item={bullet}
            {addsubItem}
            {removesubItem}
            removeItem={removeItem}
            updateItem={(updatedItem) => updateItem(i, updatedItem)}
        />
    {/each}
</ul>

<button on:click={addItem} class="btn preset-tonal-secondary ml-2 button-filled">Add Item</button>
