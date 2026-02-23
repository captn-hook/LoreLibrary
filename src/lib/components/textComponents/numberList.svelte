<script lang="ts">
    import NumberList from '$lib/components/textComponents/numberList.svelte';
    import {getClass, getStyle, loadFont} from "$lib/scripts/componentStyling";
    export let items: {text: String; subItems?: any[] }[] = [];
    export let style: Record<string, any> | undefined = undefined;

        $: if (style?.text?.["font variant"]) {
        loadFont(style.text["font variant"]);
    }
    let c_alignment ="";
    if (style?.text?.align) {
        switch (style.text.align) {
            case "Left":
                c_alignment = `self-start `;
                break;
            case "Center":
                c_alignment = `self-center `;
                break;
            case "Right":
                c_alignment = `self-end `;
                break;
        }
        delete style.text.align;
    }
    let c = getClass(style);
    const s = getStyle(style);

    const passDownStyle = (style: Record<string, any> | undefined) => {
        if (!style) return undefined;
        const newStyle: Record<string, any> = {};
        if (style.text) {
            newStyle.text = {...style.text};
            if (style.text.align){
                newStyle.text.align = ''
            }
        }
        console.log(newStyle);
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
    <div class={c_alignment + " w-fit"}>
    <ol class=" list-decimal pl-6 list-inside">
        {#each items as item}
            <li class={getFontSize() + ` ${style?.text?.font ? 'font-' + style.text.font : ''}`}>
                {item.text}

                {#if item.subItems?.length}
                    <NumberList items={item.subItems} style={passDownStyle(style)} />
                {/if}
            </li>
        {/each}
    </ol>
    </div>
</div>