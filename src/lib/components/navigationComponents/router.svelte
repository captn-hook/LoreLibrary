<script lang="ts">
    import { routerItems } from '$lib/state/routerState.svelte';
    import { get } from 'svelte/store';
    console.log('routerItems', get(routerItems));
    import {goto} from '$app/navigation';

    // Helper function to safely split and decode the path
    function getPathSegments() {
        return window.location.pathname
            .split('/')
            .filter(Boolean)
            .map(segment => decodeURIComponent(segment));
    }
</script>
<div class="flex-row items-center p-1">
    {#if $routerItems.length > 0}
        {#each $routerItems as item, index (item.id)}
            <a href="#"
            class="p-1 text-primary-500 hover:bg-primary-50 rounded align-middle"
            on:click={(e) => {
                e.preventDefault();
                $routerItems = $routerItems.slice(0, index);
                console.log("path", item.getPath());
                goto(item.getPath());
            }}>
                {item.id}
            </a>
            {#if index < $routerItems.length - 1}
                <span class="text-primary-500"> > </span>
            {/if}
        {/each}
    {:else}
        {#each getPathSegments() as segment, idx}
            <a href="#"
            class="p-1 text-primary-500 hover:bg-primary-50 rounded"
            on:click={(e) => {
                e.preventDefault();
                const newPath = '/' + getPathSegments().slice(0, idx + 1).join('/');
                console.log('newPath', newPath);
                goto(newPath);
            }}>
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
