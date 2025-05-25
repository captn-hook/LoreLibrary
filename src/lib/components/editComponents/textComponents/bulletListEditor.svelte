<script lang="ts">
    import BulletItem from './bulletItem.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';

    export let items: { id: string; text: string; subBullets?: any[] }[] = [];
    export let index: number;
     function syncToStore() {
		editComponentContents.update((contents) => {
			contents[index] = {key: "bulletList", value: items};
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
<div class="border-2 border-primary-200 bg-surface-500 rounded-lg">
	<div class="ml-[2.5%]">
		<ul class='list-disc'>
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
		
	</div>
	<button on:click={addItem} class="btn preset-tonal-primary button-filled max-w-40 ml-4 my-2">Add Item</button>
</div>	