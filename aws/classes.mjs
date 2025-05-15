class Body {
    constructor() {
    }

    // Verifies that a dict/object matches the class's required fields
    // Returns self with new data if valid
    // throws error if invalid
    static verify(data) {
        const instance = new this();
        const keys = Object.keys(instance);
        const missingKeys = keys.filter(key => !data.hasOwnProperty(key));
        if (missingKeys.length > 0) {
            throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
        }
        // Check types
        for (const key of keys) {
            if (typeof data[key] !== typeof instance[key]) {
                throw new Error(`Invalid type for key ${key}: expected ${typeof instance[key]}, got ${typeof data[key]}`);
            }
            if (Array.isArray(instance[key]) && !Array.isArray(data[key])) {
                throw new Error(`Invalid type for key ${key}: expected array, got ${typeof data[key]}`);
            }
            if (typeof instance[key] === 'object' && typeof data[key] !== 'object') {
                throw new Error(`Invalid type for key ${key}: expected object, got ${typeof data[key]}`);
            }
        }
        return Object.assign(instance, data);
    }
}

export class SignUp extends Body {
    constructor(username, email, password) {
        super();
        this.username = username; // string
        this.email = email; // string
        this.password = password; // string, hashed
    }
}

export class Token extends Body {
    constructor(token, username) {
        super();
        this.token = token; // string
        this.username = username; // string
    }
}

export class User extends Body {
    constructor(username, content = [], worlds = []) {
        super();
        this.username = username; // string
        this.content = Array.isArray(content) ? content : [content]; // array of strings
        this.worlds = Array.isArray(worlds) ? worlds : [worlds]; // array of worldIds
    }

    pk() {
        return this.username;
    }

    id() {
        return this.pk();
    }
}

// Private export class
export class Permissions {
    constructor(create = false, read = false, update = false, del = false) {
        this.create = create; // boolean
        this.read = read; // boolean
        this.update = update; // boolean
        this.del = del; // boolean
    }
}

export class DataShort extends Body {
    constructor(name, parentId, worldId, description = '', image = '', tags = []) {
        super();
        this.name = name; // string
        this.parentId = parentId; // collectionId
        this.worldId = worldId; // worldId
        this.description = description; // string
        this.image = image; // string
        this.tags = Array.isArray(tags) ? tags : [tags]; // array of strings// array of worldIds
    }

    pk() {
        return this.worldId + '#' + this.parentId;
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
}
    
export class Collection extends Entry {
    constructor(name, parentId, worldId, content = [], description = '', image = '', style = '', tags = [], permissions = {}, collections = [], entries = []) {
        super(name, parentId, worldId, content, description, image, style, tags, permissions);
        this.collections = Array.isArray(collections) ? collections : [collections]; // array of collectionIds
        this.entries = Array.isArray(entries) ? entries : [entries]; // array of entryIds
    }
}

export class World extends Collection {
    constructor(name, parentId, ownerId, content = [], description = '', image = '', style = '', tags = [], permissions = {}, collections = [], entries = []) {
        super(name, parentId, ownerId, content, description, image, style, tags, permissions, collections, entries);
    }

    pk() {
        return 'WORLD#'
    }
}
