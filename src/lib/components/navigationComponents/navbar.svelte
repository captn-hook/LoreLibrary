<script lang="ts">
    import { AppBar } from '@skeletonlabs/skeleton-svelte';
    import {editContent} from '$lib/state/editState.svelte';
    import {RouterItem} from '$lib/types/routerItem';
    import {routerItems} from '$lib/state/routerState.svelte';

    export let navItems: { name: string; href: string }[] = [];

    function addToRouter(nav: { name: string; href: string }) {
        routerItems.update(items => {
            const newItem = new RouterItem(nav.name, nav.href);
            items.push(newItem);
            return items;
        });
        
    }
</script>

<AppBar classes="bg-primary-200">
    {#snippet lead()}

    {#each navItems as nav}
    <a href={$editContent ? undefined : nav.href} class="skeleton-app-bar-item { $editContent ? 'disabled' : '' }"
    onclick={() => addToRouter(nav)}>
        {nav.name}
    </a>
    {/each}
            
    {/snippet}
</AppBar>