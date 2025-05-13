<script lang="ts">
    import { AppBar } from '@skeletonlabs/skeleton-svelte';
    import {editContent} from '$lib/state/editState.svelte';

    export let navItems: { name: string; href: string }[] = [];
</script>

<AppBar classes="bg-primary-200">
    {#snippet lead()}

    {#each navItems as nav}
    <a href={$editContent ? undefined : nav.href} class="skeleton-app-bar-item { $editContent ? 'disabled' : '' }">
        {nav.name}
    </a>
    {/each}
            
    {/snippet}
</AppBar>