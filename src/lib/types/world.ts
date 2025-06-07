import type { CardType } from '$lib/components/card/card'; 
import type { Content } from '$lib/types/content';

export class World {
    name: string;
    collections: string[];
    entries: string[];
    tags: string[];
    description: string;
    date: string;
    content: Content;
    img_url: string;
    ownerId: string;
    styling: string;


    constructor(name: string, collections: string[], entries: string[], tags: string[], description: string, date: string, content: Content, img_url: string, ownerId: string, styling: string) {
        this.name = name;
        this.collections = collections;
        this.entries = entries
        this.tags = tags;
        this.description = description;
        this.date = date;
        this.content = content;
        this.img_url = img_url;
        this.ownerId = ownerId;
        this.styling = styling; 
    }

    toCardType(): CardType {
        return {
            imgSrc: this.img_url,
            worldName: this.name,
            category: this.tags, // Join keys into a single string
            description: this.description,
            author: this.ownerId, // Assuming ownerId is the id
            date: this.date,
        } as CardType; // Map the data to the CardType
    }

    static fromJson(json: any): World {
        return new World(
            json.name || 'unknown', // Include the id argument
            json.collections || [],
            json.entries || [],
            json.tags || [],
            json.description || 'No Description',
            json.date || 'unknown',
            json.content || [],
            json.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg',
            json.parentId || 'unknown',
            json.style

        );
    }
}
