<script lang="ts">
    import { routerItems } from '$lib/state/routerState.svelte';
    import { get } from 'svelte/store';
    import {goto} from '$app/navigation';
    import {editContent} from '$lib/state/editState.svelte';
  import Page from '../../../routes/+page.svelte';

    // Helper function to safely split and decode the path
    function getPathSegments() {
        return window.location.pathname
            .split('/')
            .filter(Boolean)
            .map(segment => decodeURIComponent(segment));
    }

    function onNavigate(itemIndex: number) {
        routerItems.update(items => items.slice(0, itemIndex + 1));
    }
</script>
<div class="flex-row items-center p-1">
        {#if typeof window !== 'undefined' && $routerItems.length > 0}
            {#each $routerItems as item, index (item.id)}
                <a href={$editContent ? undefined : item.href}
                class="p-1 text-primary-500 hover:bg-primary-50 rounded align-middle"
                onclick={() => onNavigate(index)}>
                    {item.id}
                </a>
                {#if index < $routerItems.length - 1}
                    <span class="text-primary-500"> > </span>
                {/if}
            {/each}
        {:else if typeof window !== 'undefined'}
            {#each getPathSegments() as segment, idx}
                <a href={$editContent? undefined : '/' + getPathSegments().slice(0, idx + 1).join('/')}
                class="p-1 text-primary-500 hover:bg-primary-50 rounded">
                    {segment}
                </a>
                {#if idx < getPathSegments().length - 1}
                    <span class="text-primary-500"> > </span>
                {/if}
            {/each}
        {/if}
</div>
<style>
    .skeleton-link {
        color: var(--color-primary-500);
        text-decoration: none;
        padding: var(--skeleton-spacing); /* Using skeleton spacing */
        border-radius: var(--skeleton-border-radius, 0.375rem);
        transition: background-color var(--skeleton-transition-duration, 0.2s) ease;
    }

    .skeleton-link:hover {
        background-color: var(--skeleton-hover-bg, rgba(0, 112, 243, 0.1));
    }
</style>
