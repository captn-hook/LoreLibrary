<script lang="ts">
    'use client';
    import Card from "$lib/components/card/card.svelte"; // Import the Svelte component
    import { getWorlds } from "$lib/scripts/world";
    import { onMount } from "svelte"; // Import the onMount lifecycle function
    import { World } from "$lib/types/world"; // Import the Worlds type
    import { token } from "$lib/state/userState.svelte"
    import { goto } from "$app/navigation";

    let worldList: World[] = [];
    let error: Error | null = null;

    onMount(async () => {
        if (token){
            goto('/dashboard'); // Redirect to dashboard if user is logged in
        }
        try {
            worldList = await getWorlds();
        } catch (err) {
            error = err as Error;
        }
    });

  </script>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 1rem;">
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
<!-- <Controls/> -->
