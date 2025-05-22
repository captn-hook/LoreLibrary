<script lang="ts">
    export let content: Array<{ key: string; value: any }>;
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import BullletList from "$lib/components/textComponents/bulletList.svelte";
    import MarkdownReader from "$lib/components/textComponents/markdownReader.svelte";
    import HtmlReader from './textComponents/htmlReader.svelte';
</script>

    <div>
        {#each content ?? [] as component}
                {#if component.key === 'text'}
                    <p>{component.value}</p>
                {:else if component.key === 'title'}
                    <h1 class="text-4xl font-bold text-primary">{component.value}</h1>
                {:else if component.key == 'image_url'}
                    <img src={component.value} alt={component.value} />
                {:else if component.key === 'numberedList'}
                    <NumberList items={component.value} />
                {:else if component.key === 'bulletList'}
                    <BullletList items={component.value} />
                {:else if component.key === 'image'}
                    <img src={component.value} alt={component.value} />'
                {:else if component.key === 'md'}
                    <MarkdownReader md={component.value} />
                {:else if component.key === 'html'}
                    <HtmlReader html={component.value} />
                {/if}
            {/each}
    </div>