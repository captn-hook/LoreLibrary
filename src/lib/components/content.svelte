<script lang="ts">
    import type { Content } from "$lib/types/content";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BullletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import HtmlReader from './textComponents/htmlReader.svelte';

    export let content: Content;

</script>
<div>
    {#each content ?? [] as component}
    {#if component.text}
        <p>{component.text}</p>
    {:else if component.name}
        <h1 class="text-4xl font-bold text-primary">{component.name}</h1>
    {:else if component.image_url}
        <img src={component.image_url} alt ='#'/>
    {:else if component.numberedList}
        <NumberList items={component.numberedList} />
    {:else if component.bulletList}
        <BullletList items={component.bulletList} />
    {:else if component.md}
        <MarkdownReader md={component.md} />
    {:else if component.html}
        <HtmlReader html={component.html} />
    {:else if component.title}
        <h2 class="text-2xl font-semibold">{component.title}</h2>
    {/if}
{/each}
</div>
