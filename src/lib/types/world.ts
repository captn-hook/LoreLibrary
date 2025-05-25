import type { CardType } from '$lib/components/card/card'; 

export class World {
    id: string;
    collections: string[];
    tags: string[];
    description: string;
    date: string;
    content: { key: string; value: any }[];
    img_url: string;
    ownerId: string;
    styling: { name: string; styling: string[]};


    constructor(id: string, collections: string[], tags: string[], description: string, date: string, content: { key: string; value: any }[], img_url: string, ownerId: string, styling: { name: string; styling: string[]}) {
        this.id = id;
        this.collections = collections;
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
            worldid: this.id,
            category: this.tags, // Join keys into a single string
            title: this.id,
            description: this.description,
            author: this.ownerId, // Assuming ownerId is the id
            date: this.date,
        } as CardType; // Map the data to the CardType
    }

    static fromJson(json: any): World {
        return new World(
            json.content[2].name || 'No ID', //needs updated later
            json.collections || [],
            json.tags || [],
            json.description|| 'No Description',
            json.date || 'unknown',
            json.content.map((item: any) => {
                const key = Object.keys(item)[0];
                const value = item[key];
                return { key, value };
            }),
            json.content[1].image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg', //needs updated later
            json.parentId || 'unknown',
            {name: "custom", styling: json.styling || []} 

        );
    }
}
