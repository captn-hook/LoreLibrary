export class World {
    id: string;
    data: { key: string; value: any }[];

    constructor(id: string, data: { key: string; value: any }[]) {
        this.id = id;
        this.data = data;
    }
}