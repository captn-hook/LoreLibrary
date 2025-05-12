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
    on:input={(e) => {
        if (e.target) {
            content = (e.target as HTMLTextAreaElement).value.replace(/\n/g, '');
        }
        syncToStore();
    }}
    rows="10"
    cols="50"
    placeholder="Enter your texthere..."
    class="textarea bg-surface-200 max-w-[50%] max-h-40 border-2 border-primary-200 text-surface m-2"
></textarea>
