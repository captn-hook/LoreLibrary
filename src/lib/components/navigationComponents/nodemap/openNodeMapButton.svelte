<script lang="ts">
import { Waypoints } from "lucide-svelte";

export let onClick: () => void;
</script>

<button class="btn preset-tonal-primary border-[1px] border-surface-200-800 card-hover h-fill rounded-md  mb-1 mt-2 " on:click={onClick}>
    <Waypoints class="w-6 h-6"/>
</button>