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
<div class="relative">
<textarea
    bind:value={content}
    on:input={() => syncToStore()}
    rows="10"
    cols="50"
    placeholder="Enter your html content here..."
    class="textarea bg-surface-500 max-w-[100%] border-2 border-primary-200 text-surface"
></textarea>
<div class="absolute top-2 right-2">
    <DeleteComponentButton {index} />
</div>
</div>
