<script lang="ts">
    import { onMount } from "svelte";
    import {getClass, getStyle, loadFont} from "$lib/scripts/componentStyling";
    export let content: string;
    export let style: Record<string, any> | undefined;
    
    $: if (style?.text?.["font variant"]) {
        loadFont(style.text["font variant"]);
    }

    const c = getClass(style);
    const s = getStyle(style);
</script>
{#if style}
    {#if style['text'] && style['text']['size']}
        {#if style['text']['size'] === 'Header 1'}
            <h1 style={s} class={c}>{content}</h1>
        {:else if style['text']['size'] === 'Header 2'}
            <h2 style={s} class={c}>{content}</h2>
        {:else if style['text']['size'] === 'Header 3'}
            <h3 style={s} class={c}>{content}</h3>
        {:else if style['text']['size'] === 'Header 4'}
            <h4 style={s} class={c}>{content}</h4>
        {:else if style['text']['size'] === 'Header 5'}
            <h5 style={s} class={c}>{content}</h5>
        {:else}
            <p class={c} style={s}>{content}</p>
        {/if}
    {:else}
        <p class={c} style={s}>{content}</p>
    {/if}
{:else}
     <p class={c} style={s}>{content}</p>
{/if}