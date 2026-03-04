<script lang="ts">
    import {getClass, getStyle} from "$lib/scripts/componentStyling";
    export let url: string;
    export let style: Record<string, any> | undefined = undefined;

    const c = getClass(style);
    const s = getStyle(style);
    console.log(s);
</script>
<div class="w-full">
    <img src={url} alt="Not found" style={s} class={c + " max-w-full h-auto"} />
</div>
