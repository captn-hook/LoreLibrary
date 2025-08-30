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
import { goto } from "$app/navigation";

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
            console.log("World data:", data);
            let w = World.fromJson(data); // Convert the JSON data to a World object
            routerItems.set([new RouterItem(w.name, `/${w.name}`)]); // Set the router items with the new world
            worldContext.set(w); // Update the world context store with the new world
        })
        .catch((error) => {
            console.error("Error fetching world:", error); // Log any errors
        });
}

export function createWorld(name: string, tags: string[], description: string, imageUrl: string, type: string){
    return fetch(`${PUBLIC_API_URL}/worlds`, {
        method: 'PUT',
        headers: {
            'accept': 'application/json', // Specify the expected response format
            'Content-Type': 'application/json',
            'Authorization': `${get(token)}`, // Add the token to the headers
            'access-control-allow-origin': '*',  // Ensure you have a valid token
        },
        body: JSON.stringify({
            name:name,
            tags:tags,
            description:description,
            image: imageUrl,
            content: [],
            style: 'pine'
        }),
    })
    .then((response) => {
        if (!response.ok) {
            console.log(response.json());
            console.warn('Network response was not ok,.', response);
            return null; // Return null to handle in the next step
        }
        if (response.ok) {
            goto(`/${name}`); // Navigate to the new world page after creation
        }
    })
    .catch((error) => {
        console.error("Error creating world:", error); // Log any errors
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

export function createCollection(name: string, tags: string[], description: string, imageUrl: string) {
    let url = '';
    let path = window.location.pathname.split('/');
    if (path.length == 2) { // worldId
        url = `${PUBLIC_API_URL}/${path[1]}`;
    }else if (path.length == 3) { // worldId and collectionId
        url = `${PUBLIC_API_URL}/${path[1]}/${path[2]}`;
    }
    return fetch(url, {
        method: 'PUT',
        headers: {
            'accept': 'application/json', // Specify the expected response format
            'Content-Type': 'application/json',
            'Authorization': `${get(token)}`, // Add the token to the headers
            'access-control-allow-origin': '*',  // Ensure you have a valid token
        },
        body: JSON.stringify({
            name: name,
            tags: tags,
            description: description,
            image: imageUrl,
            content: [],
            collections: [],
            entries: [],
            parentId: path.length == 2 ? path[1] : path[2], // Set the parentId based on the current path
        }),
    }).then((response) => {
        if (!response.ok) {
            console.log(response);
            return null;
        } else if (response.ok) {
            if (path.length == 2) {

                worldContext.update((world: World | null) => {
                    if (world) {
                        world.collections.push(name);
                    }
                    return world;
                });
            } else if (path.length == 3) {
                collectionsContext.update((collections: Collection[] | null) => {
                    if (collections) {
                        const collection = collections.find((c: Collection) => c.name === decodeURIComponent(path[2]).replace(/%20/g, ' '));
                        if (collection) {
                            collection.collections.push(name);
                        }
                    }
                    return collections;
                });
        }
    }});
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
            'Authorization': `${get(token)}` // Add the token to the headers
        },
        body: JSON.stringify({content: collection.content })
    })
    .then((response) => {
        console.log(response);
    });

}

export function createEntry(name: string, tags: string[], description: string, imageUrl: string) {
    let url = '';
    let path = window.location.pathname.split('/');
    if (path.length == 2) { // worldId
        url = `${PUBLIC_API_URL}/${path[1]}`;
    }else if (path.length == 3) { // worldId and collectionId
        url = `${PUBLIC_API_URL}/${path[1]}/${path[2]}`;
    }

    return fetch(url, {
        method: 'PUT',
        headers: {
            'accept': 'application/json', // Specify the expected response format
            'Content-Type': 'application/json',
            'Authorization': `${get(token)}`, // Add the token to the headers
            'access-control-allow-origin': '*',  // Ensure you have a valid token
        },
        body: JSON.stringify({
            name: name,
            tags: tags,
            description: description,
            image: imageUrl,
            content: [],
            parentId: path.length == 2 ? path[1] : path[2], // Set the parentId based on the current path
            worldId: path[1], // Set the worldId based on the current path
        }),
    }).then((response) => {
        if (!response.ok) {
            console.log(response);
            return null;
        } else if (response.ok) {
            if (path.length == 2) {

                worldContext.update((world: World | null) => {
                    if (world) {
                        world.entries.push(name);
                    }
                    return world;
                });
            } else if (path.length == 3) {
                collectionsContext.update((collections: Collection[] | null) => {
                    if (collections) {
                        const collection = collections.find((c: Collection) => c.name === decodeURIComponent(path[2]).replace(/%20/g, ' '));
                        if (collection) {
                            collection.entries.push(name);
                        }
                    }
                    return collections;
                });
        }
    }});
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
    let path = window.location.pathname.split('/');
    let  url = `${PUBLIC_API_URL}/${path[1]}/${path[2]}/${entry?.name}`;
    if (!entry){
        return
    }
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${get(token)}` // Add the token to the headers
        },
        body: JSON.stringify({content: entry.content })
    })
    .then((response) => {
        console.log(response);
    });


}
        

export async function updateTheme(theme: string) {
    let currentPath = window.location.pathname.split('/');
    let postUrl;
    console.log(currentPath.length);
    if (currentPath.length == 2){
        const worldId = currentPath[1];
        postUrl = `${PUBLIC_API_URL}/${worldId}`;

    }else if (currentPath.length == 3){
        const worldId = currentPath[1];
        const collectionId = currentPath[2];
        postUrl = `${PUBLIC_API_URL}/${worldId}/${collectionId}`;

    }
    else if (currentPath.length == 4){
        const worldId = currentPath[1];
        const collectionId = currentPath[2];
        const entryId = currentPath[3];
        postUrl = `${PUBLIC_API_URL}/${worldId}/${collectionId}/${entryId}`;
    }
    fetch(`${postUrl}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${get(token)}`, // Add the token to the headers
            'access-control-allow-origin': '*', // Allow CORS for all origins
        },
        body: JSON.stringify({style: theme})
    })
    .then((response) => {
        console.log(response); // Log the response for debugging
    })
    .catch((error) => {
        console.error("Error updating theme:", error); // Log any errors
    });
    
}
