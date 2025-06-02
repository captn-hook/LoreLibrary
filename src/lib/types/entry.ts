import type { Content } from '$lib/types/content';

export class Entry {
    name: string;
    parentId: string;
    worldId: string;
    content: Content;
    image: string;
    styling: { name: string; styling: string[]};



    constructor(name: string, parentId: string, worldId: string, content: Content, image:string, styling: { name: string; styling: string[]}) {
        this.name = name;
        this.parentId = parentId;
        this.worldId = worldId;
        this.content = content;
        this.image = image;
        this.styling = styling; 
    }

    static fromJson(json: any): Entry {
        // console.log("Entry JSON:", json); // Log the JSON data
        return new Entry(
            json.name,
            json.parentId,
            json.worldId || 'unknown', // Include the worldId argument
            json.content,
            json.image || '#',
            json.styling && json.styling.name !== "custom"
                ? { name: json.styling.name, styling: [] }
                : { name: 'custom', styling: (json.styling?.styling || []) }
        );
    }
}
            