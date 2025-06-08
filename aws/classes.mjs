class Body {
    constructor() {
    }

    // Verifies that a dict/object matches the class's required fields
    // Returns self with new data if valid
    // throws error if invalid
    static verify(data) {
        const instance = new this();
        const keys = Object.getOwnPropertyNames(instance);
    
        // Check for missing keys
        const missingKeys = keys.filter(key => !data.hasOwnProperty(key) && instance[key] === undefined);
        if (missingKeys.length > 0) {
            throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
        }
    
        // Validate types and structure
        // If a key has a default value, it is not required
        for (const key of keys) {
            const value = data[key];
            const expectedType = typeof instance[key];

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
        return Object.assign(instance, data);
    }
}

export class SignUp extends Body {
    constructor(name, email, password) {
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
    constructor(token, name) {
        super();
        this.token = token; // string
        this.name = name; // string
    }
}

export class User extends Body {
    constructor(username, content = [], worlds = []) {
        super();
        this.username = username; // string
        this.content = Array.isArray(content) ? content : [content]; // array of strings
        this.worlds = Array.isArray(worlds) ? worlds : [worlds]; // array of worldIds
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
    constructor(create = false, read = false, update = false, del = false) {
        super();
        this.create = create; // boolean
        this.read = read; // boolean
        this.update = update; // boolean
        this.del = del; // boolean
    }
}

class DataShort extends Body {
    constructor(name, parentId, worldId, description = '', image = '', tags = []) {
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
    constructor(name, parentId, worldId, content = [], description = '', image = '', style = '', tags = [], permissions = {}) {
        super(name, parentId, worldId, description, image, tags);
        this.content = Array.isArray(content) ? content : [content]; // array of strings
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
    constructor(name, parentId, worldId, content = [], description = '', image = '', style = '', tags = [], permissions = {}, collections = [], entries = []) {
        super(name, parentId, worldId, content, description, image, style, tags, permissions);
        this.collections = Array.isArray(collections) ? collections : [collections]; // array of collectionIds
        this.entries = Array.isArray(entries) ? entries : [entries]; // array of entryIds
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
    constructor(name, parentId, worldId, content = [], description = '', image = '', style = '', tags = [], permissions = {}, collections = [], entries = []) {
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