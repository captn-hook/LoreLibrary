<script lang="ts">
    export let items: string[] = [];
</script>

<div class="pl-6">
    <ul class="list-disc">
        {#each items as item}
            <li class="my-2 text-gray-800 text-base">{item}</li>
        {/each}
    </ul>
</div>
