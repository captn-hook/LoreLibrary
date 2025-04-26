<script lang="ts">
    import { marked } from 'marked';
    export let md: string;
</script>

<div>
    {@html marked(md)}
</div>