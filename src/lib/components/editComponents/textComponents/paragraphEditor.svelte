<script lang="ts">
    export let content: string;
    export let index: number;
    export let onDragStart: (index: number) => void = () => {};
    export let onDrop: (index: number) => void = () => {};
    import MoveComponentButtons from '../controls/moveComponentButtons.svelte';
    import { editComponentContents } from '$lib/state/editState.svelte';
    import DeleteComponentButton from '../controls/deleteComponentButton.svelte';

    function syncToStore() {
        editComponentContents.update((contents) => {
            const next = [...contents];
            const existing = next[index] ?? {};
            next[index] = { ...existing, text: content };
            return next;
        });
    }
</script>
<div
    role="listitem"
    class="flex flex-row w-full items-center justify-center h-full"
    on:dragover|preventDefault
    on:drop={() => onDrop(index)}
    >
    <MoveComponentButtons index={index} onDragStart={onDragStart}/>
    <div class="rounded grid grid-cols-[1fr_auto] items-stretch border-2 p-2 border-primary-200 bg-surface-500 focus-within:ring-2 focus-within:ring-blue-500 w-[97%]">
        <textarea
            bind:value={content}
            on:input={() => syncToStore() }
            placeholder="Enter your text here..."
            rows="10"
            class="bg-transparent text-surface pr-3 w-full h-full resize-none
            border-0 outline-none ring-0 focus:outline-none focus:ring-0 align-top"
        ></textarea>
            <DeleteComponentButton {index} />
    </div>
</div>