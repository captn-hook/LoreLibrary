<script lang="ts">
    export let content: string;
    export let style: Record<string, any> | undefined;


    const c = `${style?.text.size || "p"} text-base text-wrap break-words max-w-[100%] whitespace-pre-wrap overflow-wrap-anywhere`;
</script>
{#if style}
    {#if style['text'] && style['text']['size']}
        {#if style['text']['size'] === 'h1'}
            <h1 class={c}>{content}</h1>
        {:else if style['text']['size'] === 'h2'}
            <h2 class={c}>{content}</h2>
        {:else}
            <p class={c}>{content}</p>
        {/if}
    {:else}
        <p class={c}>{content}</p>
    {/if}
{:else}
     <p class={c}>{content}</p>
{/if}