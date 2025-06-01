'use client';

import { world as worldContext, collections as collectionsContext, entry as entryContext} from "$lib/state/worldState.svelte";
import {World} from "$lib/types/world";
import {Collection} from "$lib/types/collection";
import { Entry } from "$lib/types/entry";
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';
import { routerItems } from "$lib/state/routerState.svelte";
import {RouterItem} from "$lib/types/routerItem";
import {token} from "$lib/state/userState.svelte";

function getWorldId() {
  if (!browser) {
    // Return a default or throw an error if this function is called during SSR
    return null;
  }
  const worldId = window.location.pathname.split('/')[1];
  return worldId;
}

export function getWorld(worldId: string) { 
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
            }
            console.log("World data:", data); // Log the world data for debugging
            let w = World.fromJson(data); // Convert the JSON data to a World object
            console.log("World object:", w); // Log the world object for debugging
            routerItems.set([new RouterItem(w.name, `/${w.name}`)]); // Set the router items with the new world
            worldContext.set(w); // Update the world context store with the new world
        })
        .catch((error) => {
            console.error("Error fetching world:", error); // Log any errors
        });
}

export function updateWorld() {
    const world = get(worldContext);
    console.log(world);
    if (!world) {
        return;
    }
    return fetch(`${PUBLIC_API_URL}/${world.name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${get(token)}`, // Add the token to the headers
            'access-control-allow-origin': '*', // Allow CORS for all origins
        },
        body: JSON.stringify({content: world.content})
    })
    .then((response) => {
        console.log(response);
    });
}

export function getWorlds() {
    return fetch(`${PUBLIC_API_URL}/worlds`)
        .then((response) => {
            console.log(response);
            return response.json()})
        .then((data) => {
            console.log(data);
            let worlds = data.map((world: any) => {
                return  World.fromJson(world); // this will need to be updated later
            }
            );
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
                return;
            }
            console.log(data);
            let c = Collection.fromJson(data); // Convert the JSON data to a World object
            collectionsContext.update(collections => collections ? [...collections, c] : [c]); // Add the collection to the collections context
            return;
        })
        .catch((error) => {
            console.error("Error fetching world:", error); // Log any errors
            return;
        });
}

export function updateCollection(id : string){
    const collections = get(collectionsContext);
    if (!collections) {
        return;
    }
    const collection = collections.find((collection: Collection) => collection.name === id);
    if (!collection) {
        return;
    }
    return fetch(`${PUBLIC_API_URL}/${collection.parentId}/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `${get(token)}` // Add the token to the headers
        },
        body: JSON.stringify({content: collection.content })
    })
    .then((response) => {
        console.log(response);
    });

}

export async function getEntry(worldId: string, collectionId: string, entryId: string) {
    return fetch(`${PUBLIC_API_URL}/${worldId}/${collectionId}/${entryId}`)
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
        console.log(data);
        let e = Entry.fromJson(data); // Convert the JSON data to a World object
        console.log("Entry object:", e); // Log the entry object for debugging
        if (get(routerItems).length > 0) {

            if (!get(routerItems).some(item => item.id === e.name)) {
                const parentItem = get(routerItems).find((item: RouterItem) => item.id === e.parentId);
                if (parentItem) {
                    routerItems.update(items => [...items, new RouterItem(e.name, `/${worldId}/${collectionId}/${entryId}`)]); // Add the entry to the router items
                }
            }
        }
        entryContext.set(e); // Update the entry context store with the new entry
        return e;
    })
    .catch((error) => {
        console.error("Error fetching world:", error); // Log any errors
        return null; // Return null in case of error
    });

}  

export async function updateEntry() {
    const entry = get(entryContext);
    if (!entry){
        return
    }
    return fetch(`${PUBLIC_API_URL}/${entry.worldId}/${entry.parentId}/${entry.name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `${get(token)}` // Add the token to the headers
        },
        body: JSON.stringify({content: entry.content })
    })
    .then((response) => {
        console.log(response);
    });


}
        
