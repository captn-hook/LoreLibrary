export class Entry {
    name: string;
    parentId: string;
    worldId: string;
    content: { key: string; value: any }[];
    image: string;
    styling: { name: string; styling: string[]};



    constructor(name: string, parentId: string, worldId: string, content: { key: string; value: any }[], image:string, styling: { name: string; styling: string[]}) {
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
            json.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg',
            json.styling && json.styling.name !== "custom"
                ? { name: json.styling.name, styling: [] }
                : { name: 'custom', styling: (json.styling?.styling || []) }
        );
    }
}
            