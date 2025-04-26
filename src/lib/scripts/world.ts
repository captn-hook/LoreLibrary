'use client';

import { world as worldContext} from "$lib/context/worldContext.svelte";
import {World} from "$lib/types/world";
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
    return fetch(`${PUBLIC_API_URL}/world/${worldId}`)
        .then((response) => {
            if (!response.ok) {
                console.warn('Network response was not ok, returning base world data.', response);
                return null; // Return null to handle in the next step
            }
            return response.json();
        })
        .then((data) => {
            if (!data) {
                // If no data, return base world data
                return new World(
                worldId,
                "World Name",
                [],
                [],
                "No Description",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg",
                "unknown",
                new Entry(
                worldId,
                "World Name",
                [
                { key: "bulletList", value: [{ text: "hi, im a recusive bullet list", subBullets: [] }, { text: "top level bullet", subBullets: [{ text: "lower level bullet", subBullets: [{ text: "another level down", subBullets: [] }] }] }, { text: "this is a bullet list", subBullets: [] }, { text: "bye", subBullets: [] }] },
                { key: "numberedList", value: [{ text: "hi, im a recursive numbered list", subItems: [] }, { text: "this is an item", subItems: [{ text: "a lower level", subItems: [{ text: "another level down", subBullets: [] }] }] }, { text: "bye", subItems: [] }] },
                { 
                    key: "md", 
                    value: `
# Welcome to the Markdown Reader
This is a **Markdown** example to test your component.

## Features
- **Bold text**: **Bold**
- *Italic text*: *Italic*
- [Links](https://example.com): [Link text](https://example.com)
- Inline code: \`code\`
- Code blocks:
\`\`\`javascript
console.log('Hello, world!');
\`\`\`

# h1
## h2
### h3
#### h4
##### h5
###### h6

- Blockquotes:

> This is a blockquote.
> It can span multiple lines.
> Just like this.

- Lists:
    - Item 1
    - Item 2
        - Sub-item 1
        - Sub-item 2
`
                  }                
                ]
                )
                );
            }
            console.log("World data:", data); // Log the fetched data
            let world = World.fromJson(data);
            console.log("World:", world); // Log the mapped world
            world.entry = new Entry( // Change later, component showcase for now
                worldId,
                "World Name",
                [
                    { key: "bulletList", value: [{ text: "hi, im a recusive bullet list", subBullets: [] }, { text: "top level bullet", subBullets: [{ text: "lower level bullet", subBullets: [{ text: "another level down", subBullets: [] }] }] }, { text: "this is a bullet list", subBullets: [] }, { text: "bye", subBullets: [] }] },
                    { key: "numberedList", value: [{ text: "hi, im a recursive numbered list", subItems: [] }, { text: "this is an item", subItems: [{ text: "a lower level", subItems: [{ text: "another level down", subBullets: [] }] }] }, { text: "bye", subItems: [] }] },
                ]
            );
            return world;
        })
        .catch((error) => {
            console.error("Error fetching world:", error); // Log any errors
            // Return base world data in case of error
            return new World(
                worldId,
                "World Name",
                [],
                [],
                "No Description",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg",
                "unknown",
                new Entry(
                    worldId,
                    "World Name",
                    [
                        { key: "bulletList", value: [{ text: "hi, im a recusive bullet list", subBullets: [] }, { text: "top level bullet", subBullets: [{ text: "lower level bullet", subBullets: [{ text: "another level down", subBullets: [] }] }] }, { text: "this is a bullet list", subBullets: [] }, { text: "bye", subBullets: [] }] },
                        { key: "numberedList", value: [{ text: "hi, im a recursive numbered list", subItems: [] }, { text: "this is an item", subItems: [{ text: "a lower level", subItems: [{ text: "another level down", subBullets: [] }] }] }, { text: "bye", subItems: [] }] },
                    ]
                )
            );
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
                    
