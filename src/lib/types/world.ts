import type { CardType } from '$lib/components/card/card'; // Import the type
import { Entry } from '$lib/types/entry'; // Import the Entry type
export class World {
    id: string;
    name: string;
    collections: { key: string; value: any }[];
    tags: string[];
    description: string;
    img_url: string;
    date: string;
    entry: Entry;

    constructor(id: string, name: string, collections: { key: string; value: any }[], tags: string[], description: string, img_url: string, date: string, entry: Entry) {
        this.id = id;
        this.name = name;
        this.collections = collections;
        this.tags = tags;
        this.description = description;
        this.img_url = img_url;
        this.date = date;
        this.entry = entry;
    }

    toCardType(): CardType {
        return {
            imgSrc: this.img_url,
            worldid: this.id,
            category: this.tags.toString(), // Join keys into a single string
            title: this.name,
            description: this.description,
            author: this.id, // Assuming ownerId is the id
            date: this.date,
        } as CardType; // Map the data to the CardType
    }

    static fromJson(json: any): World {
        return new World(
            json.content[2].name || 'No ID',
            json.content[2].name || 'No Name',
            json.collections || [],
            json.tags || [],
            json.content[0].text || 'No Description',
            json.content[1].image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg',
            json.date || 'unknown',
            json.content[3]?.entry || new Entry('No ID', 'No Name', [])
        );
    }
}
