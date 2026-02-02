<script lang="ts">
    export let content: string;
    export let index: number;
    import { editComponentContents } from '$lib/state/editState.svelte';
    import DeleteComponentButton from '../controls/deleteComponentButton.svelte';


    function syncToStore() {
        editComponentContents.update((contents) => {
            contents[index] = { html: content };
            return contents;
        });
    }

    $: {
        syncToStore();
    }
</script>
<div class="rounded grid grid-cols-[1fr_auto] items-stretch border-2 p-2 border-primary-200 bg-surface-500 focus-within:ring-2 focus-within:ring-blue-500">
<textarea
    bind:value={content}
    on:input={() => syncToStore()}
    rows="10"
    cols="50"
    placeholder="Enter your html content here..."
    class="bg-transparent text-surface pr-3 w-full h-full resize-none
           border-0 outline-none ring-0 focus:outline-none focus:ring-0 align-top"
></textarea>
    <DeleteComponentButton {index} />
</div>
