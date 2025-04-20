
import {
    DynamoDBDocumentClient, PutCommand, GetCommand,
    UpdateCommand, DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client();

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tablename = "lorelibrary";

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

class User {
    constructor(username, content=[], worlds=[]) {
        this.username = username; // string
        this.content = content; // array of strings
        this.worlds = worlds; // array of strings
    }
}
class World {
    constructor(name, id, content=[], tags=[], parentId=null, collections=[]) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // string
        this.collections = collections; // array of strings
    }
}
class Collection {
    constructor(name, id, content=[], tags=[], parentId=null, collections=[], entries=[]) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // string
        this.collections = collections; // array of strings
        this.entries = entries; // array of strings
    }
}
class Entry {
    constructor(name, id, content=[], tags=[], parentId=null, collections=[], resources=[]) {
        this.name = name; // string
        this.id = id; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // string
        this.collections = collections; // array of strings
        this.resources = resources; // array of strings
    }
}

function dynamo_get(table, cls, key) {
    const params = {
        TableName: table,
        Key: key
    };
    return ddbDocClient.send(new GetCommand(params))
        .then(data => {
            if (data.Item) {
                return new cls(...Object.values(data.Item));
            } else {
                throw new Error('Item not found');
            }
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

function dynamo_put(table, cls, item) {
    const params = {
        TableName: table,
        Item: item
    };
    return ddbDocClient.send(new PutCommand(params))
        .then(data => {
            return item;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

function dynamo_update(table, cls, key, update) {
    const params = {
        TableName: table,
        Key: key,
        UpdateExpression: update.expression,
        ExpressionAttributeValues: update.values,
        ReturnValues: "ALL_NEW"
    };
    return ddbDocClient.send(new UpdateCommand(params))
        .then(data => {
            if (data.Attributes) {
                return new cls(...Object.values(data.Attributes));
            } else {
                throw new Error('Item not found');
            }
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

function dynamo_delete(table, key) {
    const params = {
        TableName: table,
        Key: key
    };
    return ddbDocClient.send(new DeleteCommand(params))
        .then(data => {
            return data;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
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

        // availabe routes from ./api.yaml:
        // /worlds: GET, PUT
        if (operation === 'GET' && path === '/worlds') {
            // Get all worlds
            const params = {
                TableName: tablename,
                ProjectionExpression: 'id, name'
            };
            const data = await ddbDocClient.send(new ScanCommand(params));
            return {
                statusCode: 200,
                body: JSON.stringify(data.Items)
            };
        }
        // /signup: POST
        else if (operation === 'POST' && path === '/signup') {
            // Create a new user
            const { username } = JSON.parse(e.body);
            const user = new User(username);
            await dynamo_put(tablename, User, user);
            return {
                statusCode: 200,
                body: JSON.stringify(user)
            };
        }
        // /login: POST
        else if (operation === 'POST' && path === '/login') {
            // Login user
            const { username } = JSON.parse(e.body);
            const user = await dynamo_get(tablename, User, { username });
            return {
                statusCode: 200,
                body: JSON.stringify(user)
            };
        }
        // /users: GET
        else if (operation === 'GET' && path === '/users') {
            return notImplemented('Get all users');
        }
        // /users/{UserId}: GET, POST, DELETE
        else if (operation === 'GET' && path.startsWith('/users/')) {
            const userId = path.split('/')[2];
            return notImplemented('Get user by ID: ' + userId);
        }
        else if (operation === 'POST' && path.startsWith('/users/')) {
            const userId = path.split('/')[2];
            return notImplemented('Update user by ID: ' + userId);
        }
        else if (operation === 'DELETE' && path.startsWith('/users/')) {
            const userId = path.split('/')[2];
            return notImplemented('Delete user by ID: ' + userId);
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
                const world = await dynamo_get(tablename, World, { id: worldId });
                return {
                    statusCode: 200,
                    body: JSON.stringify(world)
                };
            } else if (operation === 'POST') {
                // Update world by ID
                const world = new World(...Object.values(JSON.parse(e.body)));
                await dynamo_update(tablename, World, { id: worldId }, {
                    expression: 'SET #name = :name',
                    values: {
                        ':name': world.name
                    }
                });
                return {
                    statusCode: 200,
                    body: JSON.stringify(world)
                };
            } else if (operation === 'DELETE') {
                // Delete world by ID
                await dynamo_delete(tablename, { id: worldId });
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'World deleted' })
                };
            }
        }
        // /{WorldId}/{CollectionId}: GET, POST, DELETE
        else if (pathsplit.length === 3) {
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            if (operation === 'GET') {
                // Get collection by ID
                const collection = await dynamo_get(tablename, Collection, { id: collectionId });
                return {
                    statusCode: 200,
                    body: JSON.stringify(collection)
                };
            } else if (operation === 'POST') {
                // Update collection by ID
                const collection = new Collection(...Object.values(JSON.parse(e.body)));
                await dynamo_update(tablename, Collection, { id: collectionId }, {
                    expression: 'SET #name = :name',
                    values: {
                        ':name': collection.name
                    }
                });
                return {
                    statusCode: 200,
                    body: JSON.stringify(collection)
                };
            } else if (operation === 'DELETE') {
                // Delete collection by ID
                await dynamo_delete(tablename, { id: collectionId });
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Collection deleted' })
                };
            }
        }
        // /{WorldId}/{CollectionId}/entries: GET, PUT
        else if (pathsplit.length === 4 && pathsplit[3] === 'entries') {
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            if (operation === 'GET') {
                // Get all entries in collection
                const params = {
                    TableName: tablename,
                    ProjectionExpression: 'id, name',
                    FilterExpression: 'worldId = :worldId AND collectionId = :collectionId',
                    ExpressionAttributeValues: {
                        ':worldId': worldId,
                        ':collectionId': collectionId
                    }
                };
                const data = await ddbDocClient.send(new ScanCommand(params));
                return {
                    statusCode: 200,
                    body: JSON.stringify(data.Items)
                };
            } else if (operation === 'PUT') {
                // Create new entry in collection
                const entry = new Entry(...Object.values(JSON.parse(e.body)));
                await dynamo_put(tablename, Entry, entry);
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            }
        }
        // /{WorldId}/{CollectionId}/{EntryId}: GET, POST, DELETE
        else if (pathsplit.length === 5) {
            const worldId = pathsplit[1];
            const collectionId = pathsplit[2];
            const entryId = pathsplit[3];
            if (operation === 'GET') {
                // Get entry by ID
                const entry = await dynamo_get(tablename, Entry, { id: entryId });
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            } else if (operation === 'POST') {
                // Update entry by ID
                const entry = new Entry(...Object.values(JSON.parse(e.body)));
                await dynamo_update(tablename, Entry, { id: entryId }, {
                    expression: 'SET #name = :name',
                    values: {
                        ':name': entry.name
                    }
                });
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            } else if (operation === 'DELETE') {
                // Delete entry by ID
                await dynamo_delete(tablename, { id: entryId });
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