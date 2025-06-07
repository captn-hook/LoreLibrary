import type {Content} from '$lib/types/content';

export class Collection {
    name: string;
    parentId: string;
    collections: string[];
    entries: string[];
    content: Content;
    image: string;
    tags: string[];
    styling: string;

    constructor(name: string, parentId: string, collections: string[], entries: string[], content: Content,image: string, tags: string[], styling: string) {
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
            json.image || '#',
            json.tags,
            json.style

        );
    }
}