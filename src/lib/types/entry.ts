export class Entry {
    id: string;
    name: string;
    content: { key: string; value: any }[];


    constructor(id: string, name: string, content: { key: string; value: any }[]) {
        this.id = id;
        this.name = name;
        this.content = content;
    }


}