<script lang="ts">
    export let content: string;
    export let index: number;
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
<div class="relative">
<textarea
    bind:value={content}
    on:input={() => syncToStore()}
    placeholder="Enter your text here..."
    rows="10"
    class="textarea bg-surface-500 max-w-[100%] max-h-13 border-2 border-primary-200 text-surface "
></textarea>
<div class="absolute top-2 right-2">
    <DeleteComponentButton {index} />
</div>
</div>