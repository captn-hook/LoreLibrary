export class Collection {
    id: string;
    ownerId: string;
    parentId: string;
    collections: string[];
    entries: string[];
    content: { key: string; value: any }[];
    tags: string[];

    constructor(id: string, ownerId: string, parentId: string, collections: string[], entries: string[], content: { key: string; value: any }[], tags: string[]) {
        this.id = id;
        this.ownerId = ownerId;
        this.parentId = parentId;
        this.collections = collections;
        this.entries = entries;
        this.content = content;
        this.tags = tags;
    }

    static fromJson(json: any): Collection {
        console.log("Collection JSON:", json); // Log the JSON data
        return new Collection(
            json.name,
            json.ownerId,
            json.parentId,
            json.collections,
            json.entries,
            json.content.map((item: any) => {
                const key = Object.keys(item)[0];
                const value = item[key];
                return { key, value };
            }),
            json.tags
        );
    }
}