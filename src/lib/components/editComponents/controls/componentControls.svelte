<script lang="ts">
    import DeleteComponentButton from "./deleteComponentButton.svelte";
    import StyleComponentButton from "./styleComponentButton.svelte";
    export let index: number;
</script>
<div class="space-y-2">
    <DeleteComponentButton index={index} />
    <StyleComponentButton index={index}/>
</div>




