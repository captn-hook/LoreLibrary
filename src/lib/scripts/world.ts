'use client';

import { world as worldContext} from "$lib/context/worldContext.svelte";
import {World} from "$lib/types/world";
import { get } from 'svelte/store';
import { browser } from '$app/environment';

function getWorldId() {
  if (!browser) {
    // Return a default or throw an error if this function is called during SSR
    return null;
  }
  const worldId = window.location.pathname.split('/')[1];
  return worldId;
}

export function getWorld(worldId : string) { //change to hit api when implimented
    if (!worldId) {
        console.error("World ID not found in the URL");
        return;
    }
    const world = new World(
        worldId,
        [
            { key: "bulletList", value: ["hi", "this is a bullet list", "bye"] },
            { key: "numberedList", value: ["hi", "this is a numbered list", "bye"] }
        ]
    );
    if (world) { 
        worldContext.set(world);
    }
}
