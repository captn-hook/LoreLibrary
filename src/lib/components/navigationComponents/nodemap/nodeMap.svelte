<script lang="ts">
    import { setupCanvas } from "./maptest";
    import { onMount } from 'svelte';
    import OpenNodeMapButton from "./openNodeMapButton.svelte";
    import { get } from 'svelte/store';
    import { token } from '$lib/state/userState.svelte';
    

    "use client";

    let canvas: HTMLCanvasElement | null = null;
    let data: any = null;
    let openNodeMap: boolean = false;
    let url: string;

    onMount(() => {
        if (typeof window !== 'undefined') {
            url = `https://2kzy6vjjm1.execute-api.us-west-2.amazonaws.com/-dev-665d038/${window.location.pathname.split('/')[1]}?map=true`;
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
                    setupCanvas(canvas, data, window.location.pathname.split('/')[1] || 'World');
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    });

</script>

<OpenNodeMapButton onClick={() => {
    openNodeMap = !openNodeMap;
    if (canvas && data) {
    }
}}/>
{#if openNodeMap}
{#if canvas}
    {@html (() => { setupCanvas(canvas, data, window.location.pathname.split('/')[1] || 'World'); return ''; })()}
{/if}
<div style="width: 100%; height: 100vh; overflow: hidden; z-index: 1; position: absolute; top: 0; left: 0; background: white;">
    <canvas bind:this={canvas} style="margin-left: auto; margin-right: auto;"></canvas>
</div>
{/if}
