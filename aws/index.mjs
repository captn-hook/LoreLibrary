import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
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
const tablename = process.env.TABLE_NAME;
const bucketname = process.env.BUCKET_NAME;

function notImplemented(name) {
    return {
        statusCode: 501,
        body: JSON.stringify({ message: `${name} not implemented` })
    };
}

function notFound(name) {
    return {
        statusCode: 404,
        body: JSON.stringify({ message: `${name} not found` })
    };
}

function badRequest(name) {
    return {
        statusCode: 400,
        body: JSON.stringify({ message: `${name} bad request` })
    };
}

async function s3_put_url(bucket, key) {
    const url = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
        { expiresIn: 60 } // 1 minute

    )
    return url;    
}

async function s3_get_url(bucket, key) {
    const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
        { expiresIn: 60 * 60 } // 1 hour
    )
    return url;
}

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
        this.worlds = worlds; // array of strings
    }
}
class World {
    constructor(name, id, content = [], tags = [], parentId = null, collections = []) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // string
        this.ownerId = parentId; // string
        this.collections = collections; // array of strings
    }
}
class Collection {
    constructor(name, id, content = [], tags = [], parentId = null, ownerId = null, collections = [], entries = []) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // string
        this.ownerId = ownerId; // string
        this.collections = collections; // array of strings
        this.entries = entries; // array of strings
    }
}
class Entry {
    constructor(name, id, content = [], tags = [], parentId = null, ownerId = null, collections = [], resources = []) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // string
        this.ownerId = ownerId; // string
        this.collections = collections; // array of strings
        this.resources = resources; // array of strings
    }
}

function match_json(json, cls) {
    const jkeys = Object.keys(json);
    const ckeys = Object.keys(cls);
    
    // if all keys in the class are present in the json, return an instance
    if (ckeys.every(key => jkeys.includes(key))) {
        const values = ckeys.map(key => json[key]);
        return new cls(...values);
    }
    // if not, return null
    return null;
}

function dynamo_get_all(table, cls, parentId = null) {
    if (!parentId) {
        const params = {
            TableName: table
        };
        return ddbDocClient.send(new QueryCommand(params))
            .then(data => data.Items.map(item => match_json(item, cls)))
            .catch(err => console.log(err));
    }
    const params = {
        TableName: table,
        FilterExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': parentId
        }
    };
    return ddbDocClient.send(new QueryCommand(params))
        .then(data => data.Items.map(item => match_json(item, cls)))
        .catch(err => console.log(err));
}

async function dynamo_get_id(table, cls, id) {
    const params = {
        TableName: table,
        Key: {
            id: id
        }
    };
    return ddbDocClient.send(new GetCommand(params))
        .then(data => match_json(data.Item, cls))
        .catch(err => console.log(err));
}

async function dynamo_put(table, cls, item) {
    const params = {
        TableName: table,
        Item: item
    };
    return ddbDocClient.send(new PutCommand(params))
        .then(data => match_json(data.Attributes, cls))
        .catch(err => console.log(err));
}

async function dynamo_update(table, cls, item) {
    const params = {
        TableName: table,
        Key: item.id,
        UpdateExpression: 'SET #name = :name',
        ExpressionAttributeNames: {
            '#name': 'name'
        },
        ExpressionAttributeValues: {
            ':name': item.name
        }
    };
    return ddbDocClient.send(new PutCommand(params))
        .then(data => match_json(data.Attributes, cls))
        .catch(err => console.log(err));
}

async function dynamo_delete(table, key) {
    const params = {
        TableName: table,
        Key: key
    };
    return ddbDocClient.send(new DeleteCommand(params))
        .then(data => match_json(data.Attributes, cls))
        .catch(err => console.log(err));
}

async function dynamo_delete_all(table, cls, key) {
    // Get the item
    const item = await dynamo_get_id(table, cls, key);
    if (!item) {
        return null;
    }
    // If the item has collections, delete them first
    if (item.collections && item.collections.length > 0) {
        for (const collectionId of item.collections) {
            await dynamo_delete_all(table, Collection, collectionId);
        }
    }
    // If the item has entries, delete them first
    if (item.entries && item.entries.length > 0) {
        for (const entryId of item.entries) {
            await dynamo_delete(table, entryId);
        }
    }
    // Delete the item
    const params = {
        TableName: table,
        Key: key
    };
    return ddbDocClient.send(new DeleteCommand(params))
        .then(data => match_json(data.Attributes, cls))
        .catch(err => console.log(err));
}


function getAuthorization(authorization = '') {
    authorization = token.split(' ')[1];
    if (!authorization || authorization === '') {
        return null;
    }
    return authorization;
}

function getToken(user) {
    // Create a token for the user
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '3h' });

    // Store the token in the database
    const tokenItem = new Token(token, user.username);
    const params = {
        TableName: process.env.TABLE_NAME,
        Item: tokenItem
    };
    return ddbDocClient.send(new PutCommand(params))
        .then(data => match_json(data.Attributes, Token))
        .catch(err => console.log(err));
}

function verifyToken(token) {
    // Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If the token is present in the database, return the user
        const params = {
            TableName: process.env.TABLE_NAME,
            Key: {
                id: decoded.username
            }
        };
        return ddbDocClient.send(new GetCommand(params))
            .then(data => match_json(data.Item, User))
            .catch(err => console.log(err));
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function verify_owner(authorization, cls, id) {
    const token = getAuthorization(authorization);
    if (!token) {
        return false;
    }
    const user = verifyToken(token);
    if (!user) {
        return false;
    }
    const item = await dynamo_get_id(tablename, cls, id);
    if (!item) {
        return false;
    }
    if (item.ownerId !== user.username) {
        return false;
    }
    return true;
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
            // Get all worlds
            const worlds = await dynamo_get_all(tablename, World);
            return {
                statusCode: 200,
                body: JSON.stringify(worlds)
            };
        } 
        else if (operation === 'PUT' && path === '/worlds') {
            // Create a new world
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Invalid token');
            }
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid token');
            }
            // Create new world
            e.body.parentId = user.username;
            const world = match_json(e.body, World);
            if (!world) {
                return badRequest('Invalid world');
            }
            const worldItem = await dynamo_put(tablename, World, world);
            if (!worldItem) {
                return badRequest('Failed to create world');
            }
            // Add world to user
            user.worlds.push(worldItem.id);
            const userItem = await dynamo_put(tablename, User, user);
            if (!userItem) {
                return badRequest('Failed to add world to user');
            }
            // Return world
            return {
                statusCode: 201,
                body: JSON.stringify(worldItem)
            };            
        }
        // /signup: POST 
        else if (operation === 'POST' && path === '/signup') {
            // Create a new user
            const user = match_json(e.body, SignIn);
            // Check if user already exists
            const existingUser = await dynamo_get_id(tablename, User, user.username);
            if (existingUser) {
                return badRequest('User already exists');
            }
            // Create new user
            const newUser = new User(user.username);
            const newUserItem = await dynamo_put(tablename, User, newUser);
            if (!newUserItem) {
                return badRequest('Failed to create user');
            }
            // Get a token for the user
            const token = await getToken(newUserItem);
            if (!token) {
                return badRequest('Failed to create token');
            }
            // Return token
            return {
                statusCode: 201,
                body: JSON.stringify(token)
            };           

        }
        // /login: POST
        else if (operation === 'POST' && path === '/login') {
            // Login user
            const user = match_json(e.body, SignIn);
            // Check if user exists
            const existingUser = await dynamo_get_id(tablename, User, user.username);
            if (!existingUser) {
                return notFound('User not found');
            }
            // Check if password is correct
            if (existingUser.password !== user.password) {
                return badRequest('Invalid password');
            }
            // Return token
            const token = await getToken(existingUser);
            if (!token) {
                return badRequest('Failed to create token');
            }
            return {
                statusCode: 200,
                body: JSON.stringify(token)
            };
        }
        // /users: GET
        else if (operation === 'GET' && path === '/users') {
            // Get all users
            const users = await dynamo_get_all(tablename, User);
            return {
                statusCode: 200,
                body: JSON.stringify(users)
            };
        }
        // /users/{UserId}: GET, POST, DELETE
        else if (operation === 'GET' && path.startsWith('/users/')) {
            // Get user by ID
            const userId = path.split('/')[2];
            const user = await dynamo_get_id(tablename, User, userId);
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
                return badRequest('Invalid token');
            }
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid token');
            }
            const userId = path.split('/')[2];
            if (user.username !== userId) {
                return badRequest('Invalid user');
            }
            e.body.username = userId;
            const userItem = match_json(e.body, User);
            if (!userItem) {
                return badRequest('Invalid user');
            }
            const updatedUser = await dynamo_update(tablename, User, userItem);
            if (!updatedUser) {
                return badRequest('Failed to update user');
            }
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
                return badRequest('Invalid token');
            }
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid token');
            }
            const userId = path.split('/')[2];
            if (user.username !== userId) {
                return badRequest('Invalid user');
            }
            const deletedUser = await dynamo_delete(tablename, { id: userId });
            if (!deletedUser) {
                return badRequest('Failed to delete user');
            }
            // Return deleted user
            return {
                statusCode: 200,
                body: JSON.stringify(deletedUser)
            };
        }
        // NOT IMPLEMENTED
        // /search: anything at all related to search
        // /resources: anything at all related to resources (images, files, etc)
        pathsplit = path.split('/');
        // /{WorldId}: GET, POST, DELETE
        if (pathsplit.length === 2) {
            const worldId = pathsplit[1];
            if (operation === 'GET') {
                // Get world by ID
                const world = await dynamo_get_id(tablename, World, worldId);
                if (!world) {
                    return notFound('World not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(world)
                };
            } else if (operation === 'POST') {
                // Update world by ID
                if (!verify_owner(e.headers.Authorization, World, worldId)) {
                    return badRequest('Invalid token');
                }
                const world = match_json(e.body, World);
                const updatedWorld = await dynamo_update(tablename, World, world);
                if (!updatedWorld) {
                    return badRequest('Failed to update world');
                }
                // Return updated world
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedWorld)
                };
            } else if (operation === 'DELETE') {
                // Delete world by ID
                if (!verify_owner(e.headers.Authorization, World, worldId)) {
                    return badRequest('Invalid token');
                }
                const deletedWorld = await dynamo_delete_all(tablename, World, worldId);
                if (!deletedWorld) {
                    return badRequest('Failed to delete world');
                }
                // Return deleted world
                return {
                    statusCode: 200,
                    body: JSON.stringify(deletedWorld)
                };
            }
        }
        // /{WorldId}/{CollectionId}: GET, POST, DELETE
        else if (pathsplit.length === 3) {
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            if (operation === 'GET') {
                // Get collection by ID
                const collection = await dynamo_get_id(tablename, Collection, collectionId);
                if (!collection) {
                    return notFound('Collection not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(collection)
                };                
            } else if (operation === 'POST') {
                // Update collection by ID
                if (!verify_owner(e.headers.Authorization, Collection, collectionId)) {
                    return badRequest('Invalid token');
                }
                const ncollection = match_json(e.body, Collection);
                const updatedCollection = await dynamo_update(tablename, Collection, ncollection);
                if (!updatedCollection) {
                    return badRequest('Failed to update collection');
                }
                // Return updated collection
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedCollection)
                };              
            } else if (operation === 'DELETE') {
                // Delete collection by ID
                if (!verify_owner(e.headers.Authorization, Collection, collectionId)) {
                    return badRequest('Invalid token');
                }
                const deletedCollection = await dynamo_delete_all(tablename, Collection, collectionId);
                if (!deletedCollection) {
                    return badRequest('Failed to delete collection');
                }
                // Return deleted collection
                return {
                    statusCode: 200,
                    body: JSON.stringify(deletedCollection)
                };

            }
        }
        // /{WorldId}/{CollectionId}/entries: GET, PUT 
        else if (pathsplit.length === 4 && operation === 'GET' && path.endsWith('/entries')) {
            const collectionId = pathsplit[2];
            // Get all entries in collection
            const entries = await dynamo_get_all(tablename, Entry, collectionId);
            if (!entries) {
                return notFound('Entries not found');
            }
            return {
                statusCode: 200,
                body: JSON.stringify(entries)
            };
        }
        else if (pathsplit.length === 4 && operation === 'PUT' && path.endsWith('/entries')) {
            // Create a new entry
            const token = getAuthorization(e.headers.Authorization);
            if (!token) {
                return badRequest('Invalid token');
            }
            const user = verifyToken(token);
            if (!user) {
                return badRequest('Invalid token');
            }
            const collectionId = pathsplit[2];
            e.body.parentId = collectionId;
            e.body.ownerId = user.username;
            const entry = match_json(e.body, Entry);
            if (!entry) {
                return badRequest('Invalid entry');
            }
            const entryItem = await dynamo_put(tablename, Entry, entry);
            if (!entryItem) {
                return badRequest('Failed to create entry');
            }
            // Add entry to collection
            const collection = await dynamo_get_id(tablename, Collection, collectionId);
            if (!collection) {
                return notFound('Collection not found');
            }
            collection.entries.push(entryItem.id);
            const updatedCollection = await dynamo_update(tablename, Collection, collection);
            if (!updatedCollection) {
                return badRequest('Failed to add entry to collection');
            }
            // Return entry
            return {
                statusCode: 201,
                body: JSON.stringify(entryItem)
            };
        }
        // /{WorldId}/{CollectionId}/{EntryId}: GET, POST, DELETE
        else if (pathsplit.length === 4) {
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            const entryId = pathsplit[3];
            if (operation === 'GET') {
                // Get entry by ID
                const entry = await dynamo_get_id(tablename, Entry, entryId);
                if (!entry) {
                    return notFound('Entry not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            } else if (operation === 'POST') {
                // Update entry by ID
                if (!verify_owner(e.headers.Authorization, Entry, entryId)) {
                    return badRequest('Invalid token');
                }
                const entry = match_json(e.body, Entry);
                const updatedEntry = await dynamo_update(tablename, Entry, entry);
                if (!updatedEntry) {
                    return badRequest('Failed to update entry');
                }
                // Return updated entry
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedEntry)
                };
            } else if (operation === 'DELETE') {
                // Delete entry by ID
                if (!verify_owner(e.headers.Authorization, Entry, entryId)) {
                    return badRequest('Invalid token');
                }
                const deletedEntry = await dynamo_delete_all(tablename, Entry, entryId);
                if (!deletedEntry) {
                    return badRequest('Failed to delete entry');
                }
                // Return deleted entry
                return {
                    statusCode: 200,
                    body: JSON.stringify(deletedEntry)
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