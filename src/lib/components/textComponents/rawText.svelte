<script lang="ts">
    import { onMount } from "svelte";

    export let content: string;
    export let style: Record<string, any> | undefined;

    const roundingTranslations: Record<string, string> = {
        "Sharp": "none",
        "Slight": "sm",
        "Medium": "md",
        "Round": "lg",
        "Full": "full"
    };

    const pixelTranslations: Record<string, string> = {
        "0px": "0",
        "1px": "1",
        "2px": "2",
        "3px": "3",
        "4px": "4",
        "5px": "5"
    };
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
        ${style?.text?.font ? `font-${style?.text?.font.toLowerCase()}` : "" }
        ${style?.text?.color ? `text-${style?.text?.color[0].toLowerCase()}-${style?.text.color[1]}` : "" }
        ${style?.border?.rounding ? `rounded-${roundingTranslations[style.border.rounding]}` : "" }
        ${style?.border?.color ? `border-${style.border.color[0].toLowerCase()}-${style.border.color[1]}` : "" }
        ${style?.border?.padding ? `p-${pixelTranslations[style.border.padding]}` : "" }
        ${style?.border?.width ? `border-${pixelTranslations[style.border.width]}` : "" }

        ${style?.background?.color ? `bg-${style.background.color[0].toLowerCase()}-${style.background.color[1]}` : "" }
        whitespace-pre-wrap break-words
    `;
    const s = style?.text?.["font variant"] ? `font-family: '${style?.text?.["font variant"]}', serif;` : "";
</script>
{#if style}
    {#if style['text'] && style['text']['size']}
        {#if style['text']['size'] === 'h1'}
            <h1 style={s} class={c}>{content}</h1>
        {:else if style['text']['size'] === 'h2'}
            <h2 style={s} class={c}>{content}</h2>
        {:else if style['text']['size'] === 'h3'}
            <h3 style={s} class={c}>{content}</h3>
        {:else if style['text']['size'] === 'h4'}
            <h4 style={s} class={c}>{content}</h4>
        {:else if style['text']['size'] === 'h5'}
            <h5 style={s} class={c}>{content}</h5>
        {/if}
    {/if}
{:else}
     <p class={c} style={s}>{content}</p>
{/if}