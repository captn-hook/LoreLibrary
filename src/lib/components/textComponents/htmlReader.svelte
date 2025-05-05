<script lang="ts">
    import DOMPurify from 'dompurify';
    export let html: string;

    // Sanitize the HTML input
    $: sanitizedHtml = DOMPurify.sanitize(html);
</script>

<div class="html">
    {@html sanitizedHtml}
</div>