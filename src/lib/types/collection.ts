import type {Content} from '$lib/types/content';

export class Collection {
    name: string;
    parentId: string;
    collections: string[];
    entries: string[];
    content: Content;
    image: string;
    tags: string[];
    styling: { name: string; styling: string[]};

    constructor(name: string, parentId: string, collections: string[], entries: string[], content: Content,image: string, tags: string[], styling: { name: string; styling: string[]}) {
        this.name = name;
        this.parentId = parentId;
        this.collections = collections;
        this.entries = entries;
        this.content = content;
        this.image = image;
        this.tags = tags;
        this.styling = styling
    }

    static fromJson(json: any): Collection {
        return new Collection(
            json.name,
            json.parentId,
            json.collections,
            json.entries,
            json.content,
            json.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg',
            json.tags,
            json.styling && json.styling.name !== "custom"
                ? { name: json.styling.name, styling: [] }
                : { name: 'custom', styling: (json.styling?.styling || []) }

        );
    }
}