<script lang="ts">
import { Waypoints } from "lucide-svelte";

export let onClick: () => void;
</script>

<button
    class="btn preset-tonal-primary border-[1px] border-surface-200-800 card-hover px-2 mr-2 rounded-md h-[100%] w-auto text-base md:text-lg lg:text-xl"
    style="aspect-ratio: 1 / 1;"
    on:click={onClick}
>
    <Waypoints class="h-6 w-6 " />
</button>