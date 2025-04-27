'use client';

import { world as worldContext} from "$lib/context/worldContext.svelte";
import {World} from "$lib/types/world";
import {Collection} from "$lib/types/collection";
import { Entry } from "$lib/types/entry";
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';
import type { CardType } from "$lib/components/card/card.ts"; // Import the type

function getWorldId() {
  if (!browser) {
    // Return a default or throw an error if this function is called during SSR
    return null;
  }
  const worldId = window.location.pathname.split('/')[1];
  return worldId;
}

export function getWorld(worldId: string) { //TO-DO - this should not return the placeholder world data, but the real one and return errors with issues
    return fetch(`${PUBLIC_API_URL}/${worldId}`)
        .then((response) => {
            if (!response.ok) {
                console.warn('Network response was not ok,.', response);
                return null; // Return null to handle in the next step
            }
            return response.json();
        })
        .then((data) => {
            if (!data) {
                console.warn('No data received, returning base world data.');
                return null; // Return null to handle in the next step
            }
            console.log("World JSON:", data); // Log the JSON data
            return World.fromJson(data); // Convert the JSON data to a World object
        })
        .catch((error) => {
            console.error("Error fetching world:", error); // Log any errors
            return null; // Return null in case of error
        });
}

export function getWorlds() {
    return fetch(`${PUBLIC_API_URL}/worlds`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Worlds data:", data); // Log the fetched data
            let worlds = data.map((world: any) => {
                return  World.fromJson(world);
            }
            );
            console.log("Worlds:", worlds); // Log the mapped worlds
            return worlds;
        }).catch((error) => {
            console.error("Error fetching worlds:", error); // Log any errors
            return []; // Return an empty array in case of error
        });
}


export function getCollection(worldId: string, collectionId: string) {
    return fetch(`${PUBLIC_API_URL}/${worldId}/${collectionId}`)
        .then((response) => {
            if (!response.ok) {
                console.warn('Network response was not ok,.', response);
                return null; // Return null to handle in the next step
            }
            return response.json();
        })
        .then((data) => {
            if (!data) {
                console.warn('No data received, returning base world data.');
                return null; // Return null to handle in the next step
            }
            return Collection.fromJson(data); // Convert the JSON data to a World object
        })
        .catch((error) => {
            console.error("Error fetching world:", error); // Log any errors
            return null; // Return null in case of error
        });
}
                    
