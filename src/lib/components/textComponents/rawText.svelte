<script lang="ts">
    import { onMount } from "svelte";

    export let content: string;
    export let style: Record<string, any> | undefined;

  const loadFont = (fontName: string) => {
    if (!fontName) return;
    const formattedFont = fontName.replace(/ /g, "+");

    const id = `font-${formattedFont}`;

    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;
      document.head.appendChild(link);
    }
  };

    $: if (style?.text?.["font variant"]) {
        loadFont(style.text["font variant"]);
    }

    const c = `
        ${style?.text.size || "p"} text
        ${style?.text?.font ? `font-${style?.text?.font}` : "" }
        whitespace-pre-wrap break-words
    `;
    const s =`font-family: '${style?.text?.["font variant"]}', serif;`
</script>
{#if style}
    {#if style['text'] && style['text']['size']}
        {#if style['text']['size'] === 'h1'}
            <h1 style={s} class={c}>{content}</h1>
        {:else if style['text']['size'] === 'h2'}
            <h2 style={s} class={c}>{content}</h2>
        {:else}
            <p class={c}>{content}</p>
        {/if}
    {:else}
        <p class={c}>{content}</p>
    {/if}
{:else}
     <p class={c}>{content}</p>
{/if}