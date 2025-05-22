<script lang="ts">
    import { AppBar } from '@skeletonlabs/skeleton-svelte';
    export let navItems: { name: string; href: string }[] = [];
</script>

<AppBar classes="bg-primary-200">
    {#snippet lead()}

    {#each navItems as nav}
    <a href={nav.href} class="skeleton-app-bar-item">
        {nav.name}
    </a>
    {/each}
            
    {/snippet}
</AppBar>