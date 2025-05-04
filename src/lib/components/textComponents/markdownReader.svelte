<script lang="ts">
    import { marked } from 'marked';
    export let md: string;
</script>

<div class="md">
    {@html marked(md)}
</div>


<style>
    :global(.md h1) {
        font-size: 2em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    :global(.md h2) {
        font-size: 1.75em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    :global(.md h3) {
        font-size: 1.5em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    :global(.md h4) {
        font-size: 1.25em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    :global(.md h5) {
        font-size: 1em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    :global(.md h6) {
        font-size: 0.875em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    :global(.md ul) {
        list-style-type: disc;
        margin-left: 2em;
    }
    :global(.md ol) {
        list-style-type: decimal;
        margin-left: 2em;
    }
    :global(.md li) {
        margin-bottom: 0.5em;
    }
    :global(.md p) {
        margin-bottom: 1em;
    }
    :global(.md blockquote) {
        border-left: 4px;
        padding-left: 1em;
        margin: 1em 0;
    }
    :global(.md code) {
        padding: 0.2em 0.4em;
        border-radius: 3px;
    }
    :global(.md pre) {
        padding: 1em;
        border-radius: 3px;
        overflow-x: auto;
    }
    :global(.md pre code) {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
    }
    :global(.md a) {
        color: #007bff;
        text-decoration: none;
    }
    :global(.md a:hover) {
        text-decoration: underline;
    }
    :global(.md strong) {
        font-weight: bold;
    }
    :global(.md em) {
        font-style: italic;
    }
    :global(.md hr) {
        border: 0;
        border-top: 1px;
        margin: 1em 0;
    }
    :global(.md table) {
        width: 95%;
        border-collapse: collapse;
        margin: 1em auto;
    }
    :global(.md th) {
        padding: 0.5em;
        text-align: left;
        border-bottom: 2px solid black;
    }
    :global(.md td) {
        padding: 0.5em;
        border: 1px solid black;
    }
    :global(.md table tr:nth-child(even)) {
        background-color: transparent;
    }
    :global(.md table tr:hover) {
        background-color: transparent;
    }
</style>
