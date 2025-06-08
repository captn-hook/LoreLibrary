<script lang="ts">
    import { setupCanvas } from "./maptest";
    import { onMount } from 'svelte';
    import OpenNodeMapButton from "./openNodeMapButton.svelte";
    import { get } from 'svelte/store';
    import { token } from '$lib/state/userState.svelte';
  import { PUBLIC_API_URL } from "$env/static/public";
    

    "use client";

    let canvas: HTMLCanvasElement | null = null;
    let data: any = null;
    let openNodeMap: boolean = false;
    let url: string;

    onMount(() => {
        if (typeof window !== 'undefined') {
            url = `${PUBLIC_API_URL}/${window.location.pathname.split('/')[1]}?map=true`;
        }
        // Fetch data only on the client side
        fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': `${get(token)}`, // Add the token to the headers
    }})
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(json => {
                data = json;
                console.log("Data fetched:", data);
                if (canvas) {
                    console.log("Setting up canvas with data:", data);
                    setupCanvas(canvas, data, window.location.pathname.split('/')[1] || 'World', closeNodeMap);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    });
function closeNodeMap(){
    openNodeMap = false;
}
</script>

<OpenNodeMapButton onClick={() => {
    openNodeMap = !openNodeMap;
    if (canvas && data) {
    }
}}/>
{#if openNodeMap}
{#if canvas}
    {@html (() => { setupCanvas(canvas, data, window.location.pathname.split('/')[1] || 'World', closeNodeMap); return ''; })()}
{/if}
<div class="fixed inset-0 z-1000 flex items-center justify-center w-full h-full 
    bg-gradient-to-b from-surface-100 to-surface-500 
    dark:from-surface-700 dark:to-surface-900">
    <div style="position: absolute; top: 16px; right: 16px; z-index: 2;">
        <button class="btn preset-tonal-primary border-[1px] border-surface-200-800 card-hover px-2 rounded-md p-4 px-4" on:click={() => openNodeMap = false}>
            Exit
        </button>
    </div>
    <canvas bind:this={canvas} style="display: block; margin: 0 auto;"></canvas>
</div>
{/if}
