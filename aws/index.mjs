import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const s3Client = new S3Client();

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const dataTable = process.env.DATA_TABLE;
const bucketname = process.env.BUCKET_NAME;

class SignIn {
    constructor(username, password) {
        this.username = username; // string
        this.password = password; // string, hashed
    }
}
class Token {
    constructor(token, username) {
        this.token = token; // string
        this.username = username; // string
    }
}
class User {
    constructor(username, content = [], worlds = []) {
        this.username = username; // string
        this.content = content; // array of strings
        this.worlds = worlds; // array of worldIds
    }
}
class World {
    constructor(name, id, content = [], tags = [], parentId = null, collections = []) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // username
        this.ownerId = parentId; // username
        this.collections = collections; // array of strings
    }
}
class Collection {
    constructor(name, id, content = [], tags = [], parentId = null, ownerId = null, collections = [], entries = []) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // collectionId or worldId
        this.ownerId = ownerId; // username
        this.collections = collections; // array of collectionIds
        this.entries = entries; // array of entryIds
    }
}
class Entry {
    constructor(name, id, content = [], tags = [], parentId = null, ownerId = null, collections = [], resources = []) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // collectionId
        this.ownerId = ownerId; // username
    }
}

class Resource {
    constructor(id, url, ownerId, description = '') {
        this.id = id; // string
        this.url = url; // s3 url
        this.ownerId = ownerId; // username
        this.description = description; // string
    }
}

function notFound(message) {
    return {
        statusCode: 404,
        body: JSON.stringify({ message })
    };
}

function notImplemented(message) {
    return {
        statusCode: 501,
        body: JSON.stringify({ message })
    };
}

function badRequest(message) {
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    };
}

async function dynamo_get_all(model) {
    
    const prefix = model.name.toUpperCase() + '#';
    const params = {
        TableName: dataTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': prefix
        }
    };

    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        if (data.Items) {
            return data.Items.map(item => {
                const { PK, SK, ...rest } = item;
                return rest;
            });
        }
        return [];
    }
    catch (err) {
        console.error("Error getting items:", err);
        throw new Error("Error getting items");
    }
}

async function dynamo_get_id(model, id) {

    const prefix = model.name.toUpperCase() + '#';
    const params = {
        TableName: dataTable,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': prefix,
            ':sk': id
        }
    };
    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        if (data.Items) {
            return data.Items.map(item => {
                const { PK, SK, ...rest } = item;
                return rest;
            });
        }
        return null;
    }
    catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
}

async function dynamo_create(data, model, username) {
    // Create a new item in the database and update associated items
    const prefix = model.name.toUpperCase() + '#';

    data.ownerId = username;
    data.id = crypto.randomUUID();

    const newItem = {
        PK: prefix,
        SK: id,
        ...data
    };

    let associatedItems = [];

    if (model === World) {
        // update user with new world
        const user = await dynamo_get_id(User, username);
        if (!user) {
            throw new Error("User not found");
        }
        user.worlds.push(id);
        associatedItems.push(user);
    } else if (model === Collection) {
        // update parentid with new collection
        const world = await dynamo_get_id(World, data.parentId);
        if (!world) {
            // try to get collection
            const collection = await dynamo_get_id(Collection, data.parentId);
            if (!collection) {
                throw new Error("Parent not found");
            }
            collection.collections.push(id);
            associatedItems.push(collection);
        } 
        else {
            world.collections.push(id);
            associatedItems.push(world);
        }
    } else if (model === Entry) {
        // update parentid with new entry
        const collection = await dynamo_get_id(Collection, data.parentId);
        if (!collection) {
            throw new Error("Parent not found");
        }
        collection.entries.push(id);
        associatedItems.push(collection);
    }

    let transactionItems = [];

    transactionItems.push({
        Put: {
            TableName: dataTable,
            Item: newItem
        }
    });

    for (const item of associatedItems) {
        const prefix = item.constructor.name.toUpperCase() + '#';
        const newItem = {
            PK: prefix,
            SK: item.id,
            ...item
        };
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: newItem
            }
        });
    }
    
    try {
        const result = await ddbDocClient.send(new TransactWriteItemsCommand({
            TransactItems: transactionItems
        }));
        return newItem;
    } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
    }
}

async function dynamo_update(model, data, username) {
    // Update an existing item in the database
    const prefix = model.name.toUpperCase() + '#';
    const params = {
        TableName: dataTable,
        Key: {
            PK: prefix,
            SK: data.id
        },
        UpdateExpression: 'SET #data = :data',
        ExpressionAttributeNames: {
            '#data': 'data'
        },
        ExpressionAttributeValues: {
            ':data': data
        }
    };

    try {
        const result = await ddbDocClient.send(new UpdateCommand(params));
        return result.Attributes;
    } catch (err) {
        console.error("Error updating item:", err);
        throw new Error("Error updating item");
    }
}

async function dynamo_delete(model, id, username) {
    // Delete an item from the database and update associated items
    const prefix = model.name.toUpperCase() + '#';
    const params = {
        TableName: dataTable,
        Key: {
            PK: prefix,
            SK: id
        }
    };

    // get the item to delete
    const item = await dynamo_get_id(model, id);
    if (!item) {
        throw new Error("Item not found");
    }
    
    let associatedItems = [];

    let children = [];
    
    // if the item has collections or entries, add them to the children array
    if (item.collections) {
        children = children.concat(item.collections);
    }
    if (item.entries) {
        children = children.concat(item.entries);
    }

    // while there are children, get the item and add it to the associatedItems array,
    // add its children to the children array
    while (children.length > 0) {
        const childId = children.pop();
        const child = await dynamo_get_id(model, childId);
        if (!child) {
            throw new Error("Child not found");
        }
        associatedItems.push(child);
        if (child.collections) {
            children = children.concat(child.collections);
        }
        if (child.entries) {
            children = children.concat(child.entries);
        }
    }

    // delete item and all associated items
    let transactionItems = [];

    transactionItems.push({
        Delete: {
            TableName: dataTable,
            Key: {
                PK: prefix,
                SK: id
            }
        }
    });

    for (const item of associatedItems) {
        const prefix = item.constructor.name.toUpperCase() + '#';
        transactionItems.push({
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: prefix,
                    SK: item.id
                }
            }
        });
    }

    // remove this item from its parent
    if (item.parentId) {
        const parent = await dynamo_get_id(model, item.parentId);
        if (!parent) {
            throw new Error("Parent not found");
        }
        const index = parent.collections.indexOf(id);
        if (index > -1) {
            parent.collections.splice(index, 1);
        }
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: parent
            }
        });
    }

    try {
        const result = await ddbDocClient.send(new TransactWriteItemsCommand({
            TransactItems: transactionItems
        }));
        return item;
    } catch (err) {
        console.error("Error deleting item:", err);
        throw new Error("Error deleting item");
    }
}

async function generateToken(username) {
    // Generate a token for the user
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

async function create_user(data) {
    // Create a new user
    const prefix = 'USER#';

    const newUser = {
        PK: prefix,
        SK:  data.username,
        username: data.username,
        password: await bcrypt.hash(data.password, 10),
        content: [],
        worlds: []
    };

    const params = {
        TableName: dataTable,
        Item: newUser
    };

    try {
        const result = await ddbDocClient.send(new PutCommand(params));
        return new Token(generateToken(data.username), data.username);
    }
    catch (err) {
        console.error("Error creating user:", err);
        throw new Error("Error creating user");
    }
}

async function login_user(data) {
    // Login user
    const prefix = 'USER#';
    const params = {
        TableName: dataTable,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': prefix,
            ':sk': data.username
        }
    };
    try {
        const result = await ddbDocClient.send(new GetCommand(params));
        if (result.Items.length === 0) {
            return badRequest('User not found');
        }
        const user = result.Items[0];
        const match = await bcrypt.compare(data.password, user.password);
        if (!match) {
            return badRequest('Invalid password');
        }
        const token = generateToken(user.username);
        return new Token(token, user.username);
    }
    catch (err) {
        console.error("Error logging in user:", err);
        throw new Error("Error logging in user");
    }
}   

function getAuthorization(authorization) {
    if (!authorization) {
        return null;
    }
    const token = authorization.split(' ')[1];
    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

export const handler = async (e) => {
    // The event object contains:
    // version: '2.0',
    // routeKey: 'HTTP_METHOD /path',
    // rawPath: '/stage/path',
    // rawQueryString: 'query',
    // headers: typical headers,
    // requestContext: amazon stuff,
    // isBase64Encoded: false,
    try {
        const [operation, path] = e.routeKey.split(' ');

        // /worlds: GET, PUT
        if (operation === 'GET' && path === '/worlds') {
            // Get all worlds, paginated with limit and offset
            const worlds = await dynamo_get_all(World)
            return {
                statusCode: 200,
                body: JSON.stringify(worlds)
            };
        } 
        else if (operation === 'PUT' && path === '/worlds') {
            // Create a new world
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Authentication required');
            } 
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid authentication');
            }

            const world = dynamo_create(e.body, World, user.username);
            // Return world
            return {
                statusCode: 201,
                body: JSON.stringify(world)
            };            
        }
        // /signup: POST 
        else if (operation === 'POST' && path === '/signup') {
            // Check if user already exists
            const userExists = await dynamo_get_id(User, e.body.username);
            
            if (userExists) {
                return badRequest('User already exists');
            }
            // Create user
            const token = await create_user(e.body);
            // Return token
            return {
                statusCode: 201,
                body: JSON.stringify(token)
            };           

        }
        // /login: POST
        else if (operation === 'POST' && path === '/login') {
            // Login user
            const token = await login_user(e.body);
            return {
                statusCode: 200,
                body: JSON.stringify(token)
            };
        }
        // /users: GET
        else if (operation === 'GET' && path === '/users') {
            // Get all users, paginated with limit and offset
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Authentication required');
            } 
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid authentication');
            }

            const users = await dynamo_get_all(User);
            return {
                statusCode: 200,
                body: JSON.stringify(users)
            };
        }
        // /users/{username}: GET, POST, DELETE
        else if (operation === 'GET' && path.startsWith('/users/')) {
            // Get user by ID
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Authentication required');
            } 
            const cuser = verifyToken(token); // you can get other users
            if (!cuser) {
                return badRequest('Invalid authentication');
            }

            const username = path.split('/')[2];
            const user = await dynamo_get_id(User, username);
            if (!user) {
                return notFound('User not found');
            }
            return {
                statusCode: 200,
                body: JSON.stringify(user)
            };
        }
        else if (operation === 'POST' && path.startsWith('/users/')) {
            // Update user by ID
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Authentication required');
            } 
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid authentication');
            }

            e.body.username = path.split('/')[2];

            if (user.username !== path.split('/')[2]) {
                return badRequest('Invalid user');
            }

            const updatedUser = await dynamo_update(User, e.body, user.username);
            // Return updated user
            return {
                statusCode: 200,
                body: JSON.stringify(updatedUser)
            };
        }
        else if (operation === 'DELETE' && path.startsWith('/users/')) {
            // Delete user by ID
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Authentication required');
            } 
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid authentication');
            }

            if (user.username !== path.split('/')[2] || user.username !== e.body.username) {
                return badRequest('Invalid user');
            }

            const deletedUser = await dynamo_delete(User, user.username, user.username);
            if (!deletedUser) {
                return notFound('User not found');
            }

            // Return success
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'User deleted' })
            };
        }

        // NOT IMPLEMENTED
        // /search: anything at all related to search
        if (operation === 'GET' && path === '/search') {
            return notImplemented('Search not implemented');
        }
        // /resources: anything at all related to resources (images, files, etc)
        if (path === '/resources') {
            return notImplemented('Resources not implemented');
        }
        
        pathsplit = path.split('/');
        // /{WorldId}: GET, POST, PUT, DELETE
        if (pathsplit.length === 2) {
            const worldId = pathsplit[1];
            if (operation === 'GET') {
                // Get world by ID
                const world = await dynamo_get_id(World, worldId);
                if (!world) {
                    return notFound('World not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(world)
                };
            } else if (operation === 'POST') {
                // Update world by ID
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                } 
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }
                
                const world = dynamo_update(World, e.body, user.username);
                
                // Return updated world
                return {
                    statusCode: 200,
                    body: JSON.stringify(world)
                };
            } else if (operation === 'PUT') {
                // Create a collection
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                }
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }
                e.body.worldId = worldId;
                const collection = dynamo_create(e.body, Collection, user.username);
                // Return collection
                return {
                    statusCode: 201,
                    body: JSON.stringify(collection)
                };
            } else if (operation === 'DELETE') {
                // Delete world by ID
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                } 
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }

                const world = await dynamo_delete(World, worldId, user.username);
                if (!world) {
                    return notFound('World not found');
                }

                // Return success
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'World deleted' })
                };
            }
        }
        // /{WorldId}/{CollectionId}: GET, POST, PUT DELETE
        else if (pathsplit.length === 3) {
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            if (operation === 'GET') {
                // Get collection by ID
                const collection = await dynamo_get_id(Collection, collectionId);
                if (!collection) {
                    return notFound('Collection not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(collection)
                };                
            } else if (operation === 'POST') {
                // Update collection by ID
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                } 
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;

                const collection = dynamo_update(Collection, e.body, user.username);
                if (!collection) {
                    return notFound('Collection not found');
                }
                // Return updated collection
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedCollection)
                };              
            } else if (operation === 'PUT') {
                // Creat an entry
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                }
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;

                const entry = dynamo_create(e.body, Entry, user.username);
                // Return entry
                return {
                    statusCode: 201,
                    body: JSON.stringify(entry)
                };
            } else if (operation === 'DELETE') {
                // Delete collection by ID
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                } 
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;

                const collection = await dynamo_delete(Collection, collectionId, user.username);
                if (!collection) {
                    return notFound('Collection not found');
                }

                // Return success
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Collection deleted' })
                };

            }
        }
        // /{WorldId}/{CollectionId}/{EntryId}: GET, POST, DELETE
        else if (pathsplit.length === 4) { 
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            const entryId = pathsplit[3];
            if (operation === 'GET') {
                // Get entry by ID
                const entry = await dynamo_get_id(Entry, entryId);
                if (!entry) {
                    return notFound('Entry not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            }
            else if (operation === 'POST') {
                // Update entry by ID
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                } 
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;
                e.body.entryId = entryId;

                const entry = await dynamo_update(Entry, e.body, user.username);
                if (!entry) {
                    return notFound('Entry not found');
                }
                // Return updated entry
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            }
            else if (operation === 'DELETE') {
                // Delete entry by ID
                const token = getAuthorization(e.headers.Authorization);
                if (!token) {
                    return badRequest('Authentication required');
                } 
                const user = verifyToken(token);
                if (!user) {
                    return badRequest('Invalid authentication');
                }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;
                e.body.entryId = entryId;

                const entry = await dynamo_delete(Entry, entryId, user.username);
                if (!entry) {
                    return notFound('Entry not found');
                }

                // Return success
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Entry deleted' })
                };
            }
        }
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Route not found for: ' + operation + ' ' + path })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};