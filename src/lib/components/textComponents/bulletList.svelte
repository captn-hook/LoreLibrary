<script lang="ts">
    import BulletList from '$lib/components/textComponents/bulletList.svelte';
    import {getClass, getStyle, loadFont} from "$lib/scripts/componentStyling";
    export let items: { text: string; subItems?: any[] }[] = [];
    export let style: Record<string, any> | undefined = undefined;

    
        $: if (style?.text?.["font variant"]) {
        loadFont(style.text["font variant"]);
    }

    let cAlignment ="";
    const tmp_align = style?.text?.align;
    if (style?.text?.align) {
        switch (style.text.align) {
            case "Left":
                cAlignment = `self-start `;
                break;
            case "Center":
                cAlignment = `self-center `;
                break;
            case "Right":
                cAlignment = `self-end `;
                break;
        }
        delete style.text.align; //temporarily remove align so it it not used in getClass and getStyle
    }
    const c = getClass(style);
    const s = getStyle(style);
    if (style && tmp_align) {
        style.text.align = tmp_align;//return align to preserve state, its either this or overgeneralizing getClass and getStyle
    }

    const passDownStyle = (style: Record<string, any> | undefined) => {
        if (!style) return undefined;
        const newStyle: Record<string, any> = {};
        if (style.text) {
            newStyle.text = {...style.text};
        }
        return newStyle;
    };

    const getFontSize = () => {
        if (!style || !style.text || !style.text.size) return 'text-base';
        switch (style.text.size) {
            case 'Header 1':
                return 'text-5xl ml-8';
            case 'Header 2':
                return 'text-3xl  ml-5';
            case 'Header 3':
                return 'text-2xl  ml-3';
            case 'Header 4':
                return 'text-xl  ml-2';
            case 'Header 5':
                return 'text-lg ml-1';
            default:
                return 'text-base';
        }
    };
  </script>

<div style={s} class={c + " flex flex-col"}>
    <div class={cAlignment + " w-fit"}>
        <ul class="list-disc pl-6 list-inside">
            {#each items as item}
            <li class={getFontSize() + ` ${style?.text?.font ? 'font-' + style.text.font : ''}`}>
                {item.text}
        
                {#if item.subItems?.length}
                <BulletList items={item.subItems} style={passDownStyle(style)} />
                {/if}
            </li>
            {/each}
        </ul>
    </div>
</div>