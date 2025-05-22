<script lang="ts">
    import BulletItem from './bulletItem.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';

    export let items: { id: string; text: string; subBullets?: any[] }[] = [];
    export let index: number;
     function syncToStore() {
		editComponentContents.update((contents) => {
			contents[index] = {key: "bullet", value: items};
			return contents;
		});
	}

	const addItem = () => {
		items = [...items, { id: crypto.randomUUID(), text: '', subBullets: [] }];
		syncToStore();
	};

	const removeItem = (item: { id: string }) => {
		items = items.filter((bullet) => bullet.id !== item.id);
		syncToStore();
	};

	function addSubBullet(parent: { subBullets?: any[] }) {
		parent.subBullets = parent.subBullets || [];
		parent.subBullets.push({ id: crypto.randomUUID(), text: '', subBullets: [] });
		items = [...items];
		syncToStore();
	}

	function removeSubBullet(parent: { subBullets?: any[] }, subId: string) {
		if (parent.subBullets) {
			parent.subBullets = parent.subBullets.filter((b) => b.id !== subId);
			items = [...items];
			syncToStore();
		}
	}

	const updateItem = (idx: number, updatedItem: { id: string; text: string; subBullets?: any[] }) => {
		items[idx] = updatedItem;
		items = [...items];
		syncToStore();
	};
</script>

<ul>
    {#each items as bullet, i (bullet.id)}
        <BulletItem
            item={bullet}
            {addSubBullet}
            {removeSubBullet}
            removeItem={removeItem}
            updateItem={(updatedItem) => updateItem(i, updatedItem)}
        />
    {/each}
</ul>

<button on:click={addItem} class="btn preset-tonal-secondary ml-2 button-filled">Add Item</button>
