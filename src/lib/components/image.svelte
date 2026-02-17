<script lang="ts">
    import {getClass, getStyle} from "$lib/scripts/componentStyling";
    export let url: string;
    export let style: Record<string, any> | undefined = undefined;

    const c = getClass(style);
    const s = getStyle(style);
</script>
<div class={`${c} flex justify-center`} style={s}>
    <img src={url} alt="Not found" class="max-w-full h-auto" />
</div>
