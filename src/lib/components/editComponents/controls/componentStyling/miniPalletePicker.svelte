<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let selectedColor: [string, string] = ["primary", "500"];

  const colors = ["primary", "secondary", "tertiary", "success", "warning", "error", "surface"];
  const tones = [50,100,200,300,400,500,600,700,800,900,950];
  let toneIndex = tones.indexOf(Number.parseInt(selectedColor[1])) || 5; // default to 500

  $: tone = tones[toneIndex]; // actual tone used in buttons

  const getColorClass = (key: string) => {
    const colorValue = `var(--color-${key}-${tone})`;
    return `bg-[${colorValue}]`;
    };

  const selectColor = (key: string) => {
    selectedColor[0] = key;
    dispatch("change", selectedColor);
  };
</script>

<div class="flex flex-col gap-4">
  <!-- Buttons -->
  <div class="grid grid-cols-7 gap-2">
    {#each colors as color}
      <button
        class={`h-12 w-12 rounded-md border border-surface-300 hover:scale-105 transition-transform button-filled ${getColorClass(color)}
            ${selectedColor[0] === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
        style="background-color: var(--color-{color}-{tone})"
        on:click={() => selectColor(color)}
        title={color}
        aria-label={color}
      ></button>
    {/each}
  </div>

  <!-- Labels -->
  <div class="grid grid-cols-7 gap-2 text-center text-xs font-medium text-surface-contrast-500">
    {#each colors as color}
      <div>{color}</div>
    {/each}
  </div>


  <!-- Tone slider -->
  <div class="flex items-center gap-4">
    <input
      type="range"
      min="0"
      max={tones.length - 1}
      bind:value={toneIndex}
      on:change={() => {
        selectedColor[1] = tones[toneIndex].toString();
        dispatch("change", selectedColor);}}
      class="flex-1"
    />
    <span class="w-12 text-right text-surface-contrast-500 font-semibold">{tone}</span>
  </div>
</div>