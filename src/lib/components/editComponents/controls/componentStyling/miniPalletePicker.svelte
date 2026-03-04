<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let selectedColor: [string, boolean, string] = ["primary", false, "500"];

  const colors = ["primary", "secondary", "tertiary", "success", "warning", "error", "surface"];
  const tones = [50,100,200,300,400,500,600,700,800,900,950];
  let toneIndex = tones.indexOf(Number.parseInt(selectedColor[2])) || 5; // default to 500
  let contrast = selectedColor[1];

  $: tone = tones[toneIndex]; // actual tone used in buttons

  const getColorClass = (key: string) => {
    const colorValue = `var(--color-${key}${contrast ? "-contrast" : ""}-${tone})`;
    return `bg-[${colorValue}]`;
    };

  const selectColor = (key: string) => {
    selectedColor = [key, contrast, tone.toString()];
    dispatch("change", selectedColor);
  };
</script>

<div class="flex flex-col gap-4">
  <!-- Buttons -->
  <div class="grid grid-cols-7 gap-2">
    {#each colors as color}
      <button
        class={`h-12 w-12 rounded-md border border-surface-300 hover:scale-105 transition-transform button-filled ${getColorClass(color)}
            ${selectedColor?.[0] === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
        style={`background-color: var(--color-${color}${contrast ? "-contrast" : ""}-${tone})`}
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
  <div class="flex items-center">
    <input
      type="range"
      min="0"
      max={tones.length - 1}
      bind:value={toneIndex}
      on:change={() => {
        selectedColor[2] = tones[toneIndex].toString();
        dispatch("change", selectedColor);}}
      class="flex-1"
    />
    <span class="w-12 text-right text-surface-contrast-500 font-semibold mr-10">{tone}</span>
    <div class="flex items-center gap-2">
      <label class="switch">
        <input id="contrast-toggle" type="checkbox" bind:checked={contrast}>
        <span class="slider round"></span>
      </label>

      <label
        for="contrast-toggle"
        class="text-surface-contrast-500 font-semibold cursor-pointer"
      >
        Contrast
      </label>
    </div>
  </div>
</div>


<style>
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

/* Hide default checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* Track */
.slider {
  position: absolute;   /* FIX */
  cursor: pointer;
  inset: 0;             /* cleaner than top/left/right/bottom */
  background-color: var(--color-surface-contrast-500);
  transition: 0.25s;
}

/* Knob */
.slider:before {
  position: absolute;   /* FIX */
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: var(--color-surface-contrast-100);
  transition: 0.25s;
}

/* Checked */
.switch input:checked + .slider {
  background-color: var(--color-primary-500);
}

.switch input:focus + .slider {
  box-shadow: 0 0 0 2px var(--color-primary-300);
}

.switch input:checked + .slider:before {
  transform: translateX(24px);
}

/* Rounded */
.slider.round {
  border-radius: 999px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>