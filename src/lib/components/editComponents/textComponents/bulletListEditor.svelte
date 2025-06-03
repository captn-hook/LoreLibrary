<script lang="ts">
    import BulletItem from './bulletItem.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';
	import DeleteComponentButton from '../controls/deleteComponentButton.svelte';

    export let items: { id: string; text: string; subItems?: any[] }[] = [];
    export let index: number;
     function syncToStore() {
		editComponentContents.update((contents) => {
			contents[index] = {bulletList: items};
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

	function addSubBullet(parent: { subItems?: any[] }) {
		parent.subItems = parent.subItems || [];
		parent.subItems.push({ id: crypto.randomUUID(), text: '', subItems: [] });
		items = [...items];
		syncToStore();
	}

	function removeSubBullet(parent: { subItems?: any[] }, subId: string) {
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
<div class="relative border-2 border-primary-200 bg-surface-500 rounded-lg">
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
	<div class="absolute top-2 right-2">
        <DeleteComponentButton {index} />
    </div>
</div>	