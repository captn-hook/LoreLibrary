<script lang="ts">
import { ChevronUp } from 'lucide-svelte';
import { Grip } from 'lucide-svelte';
import { ChevronDown } from 'lucide-svelte';
export let index: number = 0;
export let onDragStart: (index: number) => void;
import {editComponentContents} from "$lib/state/editState.svelte";
import { get } from 'svelte/store';

function moveUp() {
    let newContent = get(editComponentContents);
    let tmp = newContent[index - 1];
    newContent[index - 1] = newContent[index];
    newContent[index] = tmp;
    editComponentContents.set(newContent);
}

function moveDown() {
    let newContent = get(editComponentContents);
    let tmp = newContent[index + 1];
    newContent[index + 1] = newContent[index];
    newContent[index] = tmp;
    editComponentContents.set(newContent);
}
</script>

<div class="flex flex-col items-center justify-center space-y-3 p-1 pr-2 cursor-move select-none w-[3%] align-middle h-full ">
    <button onclick={moveUp}>
        <ChevronUp size={32} />
    </button>
  <div
  role="button"
  tabindex="0"
  draggable="true"
  class="cursor-grab active:cursor-grabbing"
  ondragstart={() => onDragStart(index)}
>
  <Grip size={32} />
</div>
    <button onclick={moveDown}>
        <ChevronDown size={32} />
    </button>
</div>