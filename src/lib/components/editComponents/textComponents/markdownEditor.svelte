<script lang="ts">
    export let content: string;
    export let index: number;
    import { editComponentContents } from '$lib/state/editState.svelte';


    function syncToStore() {
        editComponentContents.update((contents) => {
            contents[index] = { key: "md", value: content };
            return contents;
        });
    }

    $: {
        syncToStore();
    }
</script>

<textarea
    bind:value={content}
    on:input={() => syncToStore()}
    rows="10"
    cols="50"
    placeholder="Enter your markdown content here..."
    class="textarea bg-surface-500 max-w-[100%] border-2 border-primary-200 text-surface "
></textarea>
