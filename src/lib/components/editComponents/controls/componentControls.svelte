<script lang="ts">
    import DeleteComponentButton from "./deleteComponentButton.svelte";
    import StyleComponentButton from "./styleComponentButton.svelte";
    export let index: number;
    let disabledOwner: string | null = null;

    
</script>
<div class="space-y-2">
    <DeleteComponentButton index={index} bind:disabledOwner={disabledOwner}/>
    <StyleComponentButton index={index} bind:disabledOwner={disabledOwner}/>
</div>




