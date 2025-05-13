export class SignUp {
    constructor(username, email, password) {
        this.username = username; // string
        this.email = email; // string
        this.password = password; // string, hashed
    }
}

export class Token {
    constructor(token, username) {
        this.token = token; // string
        this.username = username; // string
    }
}

export class User {
    constructor(username, content = [], worlds = []) {
        this.username = username; // string
        this.content = content; // array of strings
        this.worlds = worlds; // array of worldIds
    }
}

// Private export class
export class Permissions {
    constructor(create = false, read = false, update = false, del = false) {
        this.create = create; // boolean
        this.read = read; // boolean
        this.update = update; // boolean
        this.delete = del; // boolean
    }
}

export class DataShort {
    constructor(name, parentId, worldId, description = '', image = '', tags = []) {
        this.name = name; // string
        this.parentId = parentId; // collectionId
        this.worldId = worldId; // worldId
        this.description = description; // string
        this.image = image; // string
        this.tags = tags; // array of strings
    }

    pk() {
        return this.worldId + '#' + this.parentId;
    }

    id() {
        return this.pk(), this.name;
    }
}

export class Entry extends DataShort {
    constructor(name, parentId, worldId, content = [], description = '', image = '', style = '', tags = [], permissions = {}) {
        super(name, parentId, worldId, description, image, tags);
        this.content = content; // array of strings
        this.style = style; // string
        this.permissions = permissions; // Permissions object
    }
}
    
export class Collection extends Entry {
    constructor(name, parentId, worldId, content = [], description = '', image = ''. style = '', tags = [], permissions = {}, collections = [], entries = []) {
        super(name, parentId, worldId, content, description, image, style, tags, permissions);
        this.collections = collections; // array of collectionIds
        this.entries = entries; // array of entryIds
    }
}

export class World extends Collection {
    constructor(name,  parentId, ownerId, content = [], description = '', image = ''. style = '', tags = [], permissions = {}, collections = [], entries = []) {
        super(name, parentId, ownerId, content, description, image, style, tags, permissions, collections, entries);
    }

    pk() {
        return 'WORLD#'
    }
}
