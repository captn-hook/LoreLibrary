<script lang="ts">
    import NumberItem from './numberItem.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';
	import ComponentControls from '../controls/componentControls.svelte';
    import MoveComponentButtons from '../controls/moveComponentButtons.svelte';
    export let items: { id: string; text: string; subItems?: any[] }[] = [];
    export let index: number;
	export let onDragStart: (index: number) => void = () => {};
    export let onDrop: (index: number) => void = () => {};

	 function syncToStore() {
		editComponentContents.update((contents) => {
			const next = [...contents];
			const existing = next[index] ?? {};
			next[index] = { ...existing, numberedList: items };
			return next;
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

	const updateItem = (id: number, updatedItem: { id: string; text: string; subItems?: any[] }) => {
		items[id] = updatedItem;
		items = [...items];
		syncToStore();
	};
</script>

<div
    role="listitem"
    class="flex flex-row w-full items-center justify-center h-full"
    on:dragover|preventDefault
    on:drop={() => onDrop(index)}
    >
    <MoveComponentButtons index={index} onDragStart={onDragStart}/>
    <div class="rounded grid grid-cols-[1fr_auto] items-stretch border-2 p-2 border-primary-200 bg-surface-500 focus-within:ring-2 focus-within:ring-blue-500 w-[97%]">
	<!-- <div class="relative border-2 border-primary-200 bg-surface-500 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 w-[97%]"> -->
		<div>
			<ol class="list-decimal pl-[2.5%] border-l border-muted ">
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

		<button on:click={addItem} class="btn preset-tonal-primary button-filled max-w-40 ml-4 my-2">Add Item</button>
        		</div>
		<ComponentControls index={index} type="nl" />
    </div>
</div>
