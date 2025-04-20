<script type="ts">
    import { world as importedWorld } from "$lib/context/worldContext.svelte";
    import BulletList from "$lib/components/textComponents/bulletList.svelte";
    import NumberList from "$lib/components/textComponents/numberList.svelte";
    import { getWorld } from "$lib/scripts/world";
    import { onMount } from 'svelte';

    export let data;
    onMount(() => {
        getWorld(data.worldid);
    });
</script>
<h1>Viewing Entry: {data.worldid}</h1>

{#each $importedWorld?.data || [] as { key, value }}
    {#if key === "bulletList"}
        <BulletList items={value} />
    {:else if key === "numberedList"}
        <NumberList items={value} />
    {:else if key === "text"}
        <p>{value}</p>
    {:else if key === "image"}
        <img src={value} alt="Image" />
    {/if}
{/each}