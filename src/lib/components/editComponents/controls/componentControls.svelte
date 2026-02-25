<script lang="ts">
    import DeleteComponentButton from "./deleteComponentButton.svelte";
    import StyleComponentButton from "./componentStyling/styleComponentButton.svelte";
    export let index: number;
    export let type: string;
    let disabledOwner: string | null = null;

    
</script>
<div class="space-y-2">
    <DeleteComponentButton index={index} bind:disabledOwner={disabledOwner}/>
    <StyleComponentButton index={index} type={type} bind:disabledOwner={disabledOwner}/>
</div>




