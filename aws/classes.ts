import type { AttributeValue } from "@aws-sdk/client-dynamodb";

export class Body {
    [key: string]: any;
    
    constructor() {
    }

    // Verifies that a dict/object matches the class's required fields
    // Returns self with new data if valid
    // throws error if invalid
    static verify<T extends typeof Body>(this: T, data: object): InstanceType<T> {
        try {
            const instance = new this();
            const keys = Object.getOwnPropertyNames(instance);
        
            // Check for missing keys
            const missingKeys = keys.filter(key => 
                !data.hasOwnProperty(key) && (instance as any)[key] === undefined
            );
            if (missingKeys.length > 0) {
                throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
            }
        
            // Validate types and structure
            // If a key has a default value, it is not required
            for (const key of keys) {
                const value = (data as any)[key];
                const expectedType = typeof (instance as any)[key];

                // If the expected type is undefined, the key is required to be a string or null
                if (expectedType === 'undefined') {
                    if (typeof value !== 'string' && value !== null) {
                        throw new Error(`Invalid type for key "${key}": expected string, got ${typeof value}`);
                    }    
                }
                // Check if the type matches
                else if (value !== undefined && typeof value !== expectedType) {
                    throw new Error(`Invalid type for key "${key}": expected ${expectedType}, got ${typeof value}`);
                }
                // If the value is an array, check if all elements are of the same type
                else if (Array.isArray(value)) {
                    const elementType = typeof value[0];
                    for (const element of value) {
                        if (typeof element !== elementType) {
                            throw new Error(`Invalid type for key "${key}": expected array of ${elementType}, got ${typeof element}`);
                        }
                    }
                }           
            }
        
            // Assign validated data to the instance
            return Object.assign(instance, data) as InstanceType<T>;
        } catch (error) {
            console.error(`Error verifying data for ${this.name}:`, error);
            throw error;
        }
    }

    marshal(): Record<string, AttributeValue> {
        const convert = (value: any): AttributeValue => {
            if (value === null || value === undefined) {
                return { NULL: true };
            } else if (typeof value === 'string') {
                return { S: value };
            } else if (typeof value === 'number') {
                return { N: value.toString() };
            } else if (typeof value === 'boolean') {
                return { BOOL: value };
            } else if (Array.isArray(value)) {
                return { L: value.map(v => convert(v)) };
            } else if (value instanceof Body) {
                return { M: value.marshal() };
            } else if (typeof value === 'object') {
                const map: Record<string, AttributeValue> = {};
                for (const k in value) {
                    if (value.hasOwnProperty(k)) {
                        map[k] = convert(value[k]);
                    }
                }
                return { M: map };
            } else {
                throw new Error(`Unsupported type for DynamoDB marshal: ${typeof value}`);
            }
        };

        const result: Record<string, AttributeValue> = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                result[key] = convert(this[key]);
            }
        }
        return result;
    }
}

export class SignUp extends Body {
    name: string;
    email: string;
    password: string;

    constructor(name: string, email: string, password: string) {
        super();
        this.name = name; // string
        this.email = email; // string
        this.password = password; // string, hashed
    }

    get username() {
        return this.name;
    }

    set username(value) {
        this.name = value;
    }
}

export class Token extends Body {
    token: string;
    name: string;
    
    constructor(token: string, name: string) {
        super();
        this.token = token; // string
        this.name = name; // string
    }
}

export class User extends Body {
    username: string;
    content: string[];
    worlds: string[];
    
    constructor(username = '', content: string[] = [], worlds: string[] = []) {

        if (username === '') {
            throw new Error('Username is required');
        }

        super();
        this.username = username; // string
        this.content = content;
        this.worlds = worlds;
    }

    get name() {
        return this.username;
    }

    set name(value) {
        this.username = value;
    }

    pk() {
        return 'USER#';
    }

    sk() {
        return this.name;
    }

    id() {
        return this.pk() + this.sk();
    }

    getBody() {
        return {
            username: this.username,
            content: this.content,
            worlds: this.worlds
        };
    }
}

// Private export class
export class Permissions extends Body {
    create: boolean;
    read: boolean;
    update: boolean;
    del: boolean;

    constructor(create = false, read = false, update = false, del = false) {
        super();
        this.create = create; // boolean
        this.read = read; // boolean
        this.update = update; // boolean
        this.del = del; // boolean
    }
}

class DataShort extends Body {
    name: string;
    parentId: string | null;
    worldId: string;
    description: string;
    image: string;
    tags: string[];
    
    constructor(name: string, parentId: string | null, worldId: string, description = '', image = '', tags = []) {
        super();
        this.name = name; // string
        this.parentId = parentId; // collectionId
        this.worldId = worldId; // worldId
        this.description = description; // string
        this.image = image; // string
        this.tags = Array.isArray(tags) ? tags : [tags]; // array of strings// array of worldIds
    }

    getBody() {
        // usage:
        // const newItem = {
        //     PK: data.pk(),
        //     SK: data.sk(),
        //     ...data.getBody(),
        // };
        return {
            name: this.name,
            parentId: this.parentId,
            description: this.description,
            image: this.image,
            tags: this.tags
        };
    }
    

    pk() {
        return this.worldId + '#'
    }

    sk() {
        return this.name;
    }

    id() {
        return [this.pk(), this.name]
    }
}

export class Entry extends DataShort {
    content: string[];
    style: string;
    permissions: Permissions;

    constructor(name = '', parentId: string | null = null, worldId = '', content = [], description = '', image = '', style = '', tags = [], permissions = new Permissions) {

        if (name == '' || worldId == '') {
            if (name == '') { throw new Error('Name is required'); }
            if (worldId == '') { throw new Error('World ID is required'); }
        }

        super(name, parentId, worldId, description, image, tags);
        this.content = content;
        this.style = style; // string
        this.permissions = permissions; // Permissions object
    }
    
    getBody() {
        return {
            name: this.name,
            parentId: this.parentId,
            description: this.description,
            image: this.image,
            tags: this.tags,
            content: this.content,
            style: this.style,
            permissions: this.permissions,
        };
    }

    pk() {
        return this.worldId + '#ENTRY'
    }
}
    
export class Collection extends Entry {
    collections: string[];
    entries: string[];

    constructor(name = '', parentId: string | null = null, worldId = '', content = [], description = '', image = '', style = '', tags = [], permissions = new Permissions, collections = [], entries = []) {
       
        if (name == '' || worldId == '') {
            if (name == '') { throw new Error('Name is required'); }
            if (worldId == '') { throw new Error('World ID is required'); }
        }
        
        super(name, parentId, worldId, content, description, image, style, tags, permissions);
        this.collections = collections;
        this.entries = entries;
    }

    getBody() {
        return {
            name: this.name,
            parentId: this.parentId,
            description: this.description,
            image: this.image,
            tags: this.tags,
            content: this.content,
            style: this.style,
            permissions: this.permissions,
            collections: this.collections,
            entries: this.entries,
        };
    }

    pk() {
        return this.worldId + '#COLLECTION'
    }
}

export class World extends Collection {
    constructor(name = '', parentId: string | null = null, worldId = '', content = [], description = '', image = '', style = '', tags = [], permissions = new Permissions, collections = [], entries = []) {
        
        if (name == '' || worldId == '') {
            if (name == '') { throw new Error('Name is required'); }
            if (worldId == '') { throw new Error('World ID is required'); }
        }

        super(name, parentId, worldId, content, description, image, style, tags, permissions, collections, entries);
    }   

    getBody() {
        return {
            name: this.name,
            parentId: this.parentId,
            description: this.description,
            image: this.image,
            tags: this.tags,
            content: this.content,
            style: this.style,
            permissions: this.permissions,
            collections: this.collections,
            entries: this.entries,
        };
    }

    pk() {
        return 'WORLD#'
    }
}

export type Model = typeof User | typeof World | typeof Entry | typeof Collection;
export type DModel = typeof World | typeof Entry | typeof Collection;