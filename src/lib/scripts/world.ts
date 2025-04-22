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
            { key: "bulletList", value: [{text: "hi, im a recusive bullet list", subBullets: []}, {text: "top level bullet", subBullets : [{text: "lower level bullet", subBullets: [{text: "another level down", subBullets: []}]}]}, {text: "this is a bullet list", subBullets: []}, {text: "bye", subBullets: []}] },
            { key: "numberedList", value: [{text: "hi, im a recursive numbered list" ,subItems: []}, {text: "this is an item", subItems: [{text: "a lower level", subItems: [{text: "another level down", subBullets: []}]}]}, {text: "bye", subItems: []}] },
        ]
    );
    if (world) { 
        worldContext.set(world);
    }
}
