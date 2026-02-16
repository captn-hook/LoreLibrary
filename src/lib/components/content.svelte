<script lang="ts">
    import type { Content } from "$lib/types/content";
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BullletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import Image from "./image.svelte";
    import HtmlReader from './textComponents/htmlReader.svelte';
    import RawText from './textComponents/rawText.svelte';

    export let content: Content;

</script>
<div>
    {#each content ?? [] as component} 
    <div style="margin-bottom: calc(3*var(--spacing));" class="w-[75%]">
        {#if component.text}
            <RawText content={component.text} style={component.style}/>
        {:else if component.name}
            <h1 class="h1 text-5xl mb-4 text-wrap break-all max-w-[100%] whitespace-pre-wrap overflow-wrap-anywhere">{component.name}</h1>
        {:else if component.image_url}
            <Image url={component.image_url}/>
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
    </div>
{/each}
</div>