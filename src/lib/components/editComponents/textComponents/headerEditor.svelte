<script lang="ts">
    export let content: string;
    export let index: number;
    export let onDragStart: (index: number) => void = () => {};
    export let onDrop: (index: number) => void = () => {};
    import MoveComponentButtons from '../controls/moveComponentButtons.svelte';

    import { editComponentContents } from '$lib/state/editState.svelte';
    import DeleteComponentButton from '../controls/deleteComponentButton.svelte';

    $: syncToStore();

    function syncToStore() {
        // content = content.replace(/\n/g, '');
        editComponentContents.update((contents) => {
            contents[index] = { title: content };
            return contents;
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

    <div class="rounded grid grid-cols-[1fr_auto] items-stretch border-2 p-2 border-primary-200 bg-surface-500 focus-within:ring-2 focus-within:ring-blue-500">
    <textarea
        bind:value={content}
        on:input={() => syncToStore()}
        placeholder="Enter the url to your image here..."
        rows="2"
        class="bg-transparent text-surface pr-3 w-full h-full resize-none
            border-0 outline-none ring-0 focus:outline-none focus:ring-0 align-top"
    ></textarea>
    <DeleteComponentButton {index} />
    </div>
</div>  