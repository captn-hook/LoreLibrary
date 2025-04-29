export class Entry {
    id: string;
    ownerId: string;
    parentId: string;
    content: { key: string; value: any }[];


    constructor(id: string, ownerId: string, parentId: string, content: { key: string; value: any }[]) {
        this.id = id;
        this.ownerId = ownerId
        this.parentId = parentId;
        this.content = content;
    }

    static fromJson(json: any): Entry {
        // console.log("Entry JSON:", json); // Log the JSON data
        return new Entry(
            json.name,
            json.ownerId,
            json.parentId,
            json.content.map((item: any) => {
                const key = Object.keys(item)[0];
                const value = item[key];
                return { key, value };
            })
        );
    }


}