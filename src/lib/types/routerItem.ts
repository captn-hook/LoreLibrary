export class RouterItem {
    id: string;
    parent: RouterItem | null;
    type: string;

    constructor(id: string, parent: RouterItem | null, type: string) {
        this.id = id;
        this.parent = parent;
        this.type = type;
    }

    getPath(): string {
        switch (this.type) {
            case "world":
                return `/${this.id}`;
            case "collection":
                return `/${this.parent?.id}/${this.id}`;
            case "entry":
                return `/${this.parent?.parent?.id}/${this.parent?.id}/${this.id}`;
            default:
                throw new Error(`Unknown type: ${this.type}`);
        }
    }
}

