<script lang="ts">
    'use client';
    import Card from "$lib/components/card/card.svelte"; // Import the Svelte component
    import type { CardType } from "$lib/components/card/card.ts"; // Import the type 
    import { getWorlds } from "$lib/scripts/world";
    import { worlds } from "$lib/context/worldContext.svelte"; // Import the worlds context
    import { onMount } from "svelte"; // Import the onMount lifecycle function
    import { onDestroy } from "svelte";
    import { World } from "$lib/types/world"; // Import the Worlds type
    import {marked} from "marked";
    import StyleEditor from "$lib/components/editComponents/styleEditor.svelte";

    let worldList: World[] = [];
    let error: Error | null = null;

    onMount(async () => {
        try {
            worldList = await getWorlds();
        } catch (err) {
            error = err as Error;
        }
    });
</script>

<div
    style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 1rem;">
    {#if error}
        <p>Error loading worlds: {error.message}</p>
    {:else}
        {#each worldList as world}
            <Card
                card={world.toCardType()}
            />
        {/each}
    {/if}
    
</div>
<StyleEditor/>
