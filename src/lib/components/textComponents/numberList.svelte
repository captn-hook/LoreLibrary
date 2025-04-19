<script lang="ts">
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    export let items: {text: String; subItems?: any[] }[] = [];
</script>

<ol class="list-decimal pl-6">
    {#each items as item}
        <li class="my-2">
            {item.text}

            {#if item.subItems?.length}
                <NumberList items={item.subItems} />
            {/if}
        </li>
    {/each}
</ol>
