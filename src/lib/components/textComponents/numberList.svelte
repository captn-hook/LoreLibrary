<script lang="ts">
    export let items: string[] = [];
</script>

<div class="my-4 font-sans">
    {#if items.length > 0}
        <ol class="list-none p-0 m-0">
            {#each items as item, index}
                <li class="flex items-center py-2 border-b border-gray-300">
                    <span class="font-bold mr-2 text-gray-800">{index + 1}.</span> {item}
                </li>
            {/each}
        </ol>
    {:else}
        <p class="text-gray-500 italic">No items to display.</p>
    {/if}
</div>
