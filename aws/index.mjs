import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import jwt from 'jsonwebtoken';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const issuer = process.env.COGNITO_ISSUER;
const audience = process.env.COGNITO_AUDIENCE;

// Function to get the signing key
function getSigningKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
}

// Function to verify the token
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getSigningKey,
            {
                audience: audience,
                issuer: issuer,
                algorithms: ['RS256'],
            },
            (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            }
        );
    });
}

const s3Client = new S3Client();

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const userTable = process.env.USER_TABLE;
const dataTable = process.env.DATA_TABLE;
const bucketname = process.env.BUCKET_NAME;

class SignUp {
    constructor(username, email, password) {
        this.username = username; // string
        this.email = email; // string
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
    constructor(name, content = [], description = '', image = '', style = '', tags = [], parentId = null, collections = []) {
        this.name = name; // stringg
        this.content = content; // array of strings
        this.description = description; // string
        this.image = image; // string
        this.style = style; // string
        this.tags = tags; // array of strings
        this.parentId = parentId; // username
        this.ownerId = parentId; // username
        this.collections = collections; // array of strings
    }
}
class Collection {
    constructor(name, content = [], tags = [], parentId = null, ownerId = null, collections = [], entries = []) {
        this.name = name; // string
        this.content = content; // array of strings
        this.tags = tags; // array of strings
        this.parentId = parentId; // collectionId or worldId
        this.ownerId = ownerId; // username
        this.collections = collections; // array of collectionIds
        this.entries = entries; // array of entryIds
    }
}
class Entry {
    constructor(name, content = [], tags = [], parentId = null, ownerId = null, collections = [], resources = []) {
        this.name = name; // string
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

async function dynamo_get_all(model, worldId = '', table = dataTable) {
    if (!model || !model.name) {
        throw new Error("Invalid model: 'model.name' is required.");
    }

    const prefix = model.name.toUpperCase() + '#' + worldId;
    // Get all items in the table with the given prefix
    const params = {
        TableName: table,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': prefix
        }
    };
    try {
        const data = await ddbDocClient.send(new QueryCommand(params));
        if (data.Items) {
            return data.Items.map(item => {
                const { PK, SK, ...rest } = item;
                return rest;
            });
        }
        return null;
    }
    catch (err) {
        console.error("Error getting items:", err);
        throw new Error("Error getting items");
    }
}

async function dynamo_get_id(model, name, worldId = '', table = dataTable) {
    if (!model || !model.name) {
        console.log('model', model);
        throw new Error("Invalid model: 'model.name' is required.");
    }
    if (!name) {
        console.log('name', name);
        throw new Error("Invalid id: 'id' is required.");
    }

    const prefix = model.name.toUpperCase() + '#' + worldId;
    // Get an item by prefix and name
    const params = {
        TableName: table,
        Key: {
            PK: prefix,
            SK: name
        }
    };
    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        if (data.Item) {
            if (model === User) {
                const { PK, SK, ...rest } = data.Item;
                return new User(SK, rest.content, rest.worlds);
            } else if (model === World) {
                const { PK, SK, ...rest } = data.Item;
                return new World(SK, rest.content, rest.description, rest.image, rest.style, rest.tags, rest.parentId, rest.collections);
            }
            else if (model === Collection) {
                const { PK, SK, ...rest } = data.Item;
                return new Collection(SK, rest.content, rest.tags, rest.parentId, rest.ownerId, rest.collections, rest.entries);
            } else if (model === Entry) {
                const { PK, SK, ...rest } = data.Item;
                return new Entry(SK, rest.content, rest.tags, rest.parentId, rest.ownerId);
            }
            throw new Error("Invalid model: 'model' must be User, World, Collection, or Entry.");
        }
        return null;
    }
    catch (err) {
        console.log("Error getting item:", err);
        throw new Error(`Error getting item with id ${id}: ${err}`);
    }
}

async function dynamo_create(data, model, username, worldId = '', parentId = '', table = dataTable) {
    if (!model || !model.name) {
        throw new Error("Invalid model: 'model.name' is required.");
    }
    if (!data || !data.name) {
        throw new Error("Invalid data: 'data.name' is required.");
    }
    if (!username) {
        throw new Error("Invalid username: 'username' is required.");
    }

    const prefix = model.name.toUpperCase() + '#' + worldId;

    // Try to get the item in case it already exists
    const params = {
        TableName: table,
        Key: {
            PK: prefix,
            SK: data.name
        }
    };

    const existingItem = await ddbDocClient.send(new GetCommand(params));
    if (existingItem.Item) {
        throw new Error("Item already exists");
    }

    // Create a new item in the database and update associated items

    const pId = model === World ? username : parentId;

    let newItem;

    if (model === World) {
        newItem = {
            PK: prefix,
            SK: data.name,
            content: data.content || [],
            description: data.description || '',
            image: data.image || '',
            style: data.style || '',
            tags: data.tags || [],
            parentId: pId,
            ownerId: username,
            collections: []

        };
    } else if (model === Collection) {
        newItem = {
            PK: prefix,
            SK: data.name,
            content: data.content || [],
            tags: data.tags || [],
            parentId: pId,
            ownerId: username,
            collections: [],
            entries: []
        };
    } else if (model === Entry) {
        newItem = {
            PK: prefix,
            SK: data.name,
            content: data.content || [],
            tags: data.tags || [],
            parentId: pId,
            ownerId: username
        };
    } else {
        throw new Error("Invalid model: 'model' must be World, Collection, or Entry.");
    }

    let transactionItems = [];

    // add the new item to the transaction items
    transactionItems.push({
        Put: {
            TableName: dataTable,
            Item: newItem
        }
    });

    if (model === World) {
        // if world, add it to the user
        const userPrefix = 'USER#';
        const userParams = {
            TableName: userTable,
            Key: {
                PK: userPrefix,
                SK: username
            }
        };
        const userData = await ddbDocClient.send(new GetCommand(userParams));
        if (!userData.Item) {
            throw new Error("User not found");
        }
        const user = userData.Item;
        if (!user.worlds) {
            user.worlds = [];
        }
        user.worlds.push(data.name);
        transactionItems.push({
            Put: {
                TableName: userTable,
                Item: user
            }
        });
    } else if (model === Collection) {
        // if collection, add it to the world
        const worldPrefix = 'WORLD#';
        const worldParams = {
            TableName: dataTable,
            Key: {
                PK: worldPrefix,
                SK: data.worldId
            }
        };
        const worldData = await ddbDocClient.send(new GetCommand(worldParams));
        if (!worldData.Item) {
            throw new Error("World not found");
        }
        const world = worldData.Item;
        if (!world.collections) {
            world.collections = [];
        }
        world.collections.push(data.name);
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: world
            }
        });
    } else if (model === Entry) {
        // if entry, add it to the collection
        const collectionPrefix = 'COLLECTION#' + worldId;
        const collectionParams = {
            TableName: dataTable,
            Key: {
                PK: collectionPrefix,
                SK: data.collectionId
            }
        };
        const collectionData = await ddbDocClient.send(new GetCommand(collectionParams));
        if (!collectionData.Item) {
            throw new Error("Collection not found");
        }
        const collection = collectionData.Item;
        if (!collection.entries) {
            collection.entries = [];
        }
        collection.entries.push(data.name);
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: collection
            }
        });
    }

    try {
        const result = await ddbDocClient.send(new TransactWriteCommand({
            TransactItems: transactionItems
        }));
        return dynamo_get_id(model, data.name, data.worldId);
    } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
    }
}

async function dynamo_update(model, data, username, wolrdId = '', table = dataTable) {
    if (!model || !model.name) {
        throw new Error("Invalid model: 'model.name' is required.");
    }
    if (!data || !data.id) {
        throw new Error("Invalid data: 'data.id' is required.");
    }
    if (!username) {
        throw new Error("Invalid username: 'username' is required.");
    }
    // Update an existing item in the database
    const prefix = model.name.toUpperCase() + '#' + wolrdId;
    const params = {
        TableName: table,
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

async function dynamo_delete(model, id, username, wolrdId = '', table = dataTable) {
    // Delete an item from the database and update associated items
    const prefix = model.name.toUpperCase() + '#' + wolrdId;

    // get the item to delete
    const item = await dynamo_get_id(model, id, wolrdId);
    if (!item) {
        throw new Error("Item not found");
    }
    if (!item.ownerId || item.ownerId !== username) {
        throw new Error("Unauthorized");
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
        const child = await dynamo_get_id(model, childId, wolrdId);
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
            TableName: table,
            Key: {
                PK: prefix,
                SK: id
            }
        }
    });

    for (const item of associatedItems) {
        transactionItems.push({
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: item.PK,
                    SK: item.SK
                }
            }
        });
    }

    // remove this item from its parent
    if (item.parentId) {
        const parentTable = model.name === 'World' ? userTable : dataTable;
        const parent = await dynamo_get_id(model, item.parentId, wolrdId, parentTable);
        if (!parent) {
            throw new Error("Parent not found");
        }
        const index = parent.collections.indexOf(id);
        if (index > -1) {
            parent.collections.splice(index, 1);
        }
        transactionItems.push({
            Put: {
                TableName: parentTable,
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

async function create_user(data, username) {
    try {
        // Create the user in Cognito
        const signUpCommand = new SignUpCommand({
            ClientId: clientId,
            Password: data.password,
            UserPoolId: userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "email",
                    Value: data.email,
                }
            ],
        });
        
        const signUpResponse = await cognitoClient.send(signUpCommand);

        console.log("User created in Cognito:", signUpResponse);

        // Create the user in DynamoDB
        const user = new User(username, [], []);
        const params = {
            TableName: userTable,
            Item: {
                PK: "USER#",
                SK: username,
                content: [],
                worlds: []
            }
        };
        await ddbDocClient.send(new PutCommand(params));
        console.log("User created in DynamoDB:", params.Item);
        
        // Return a success response
        return { message: "User created successfully", username };
    } catch (err) {
        console.error("Error creating user in Cognito:", err);

        // Handle specific Cognito errors
        if (err.name === "UsernameExistsException") {
            throw new Error("User already exists");
        } else if (err.name === "InvalidPasswordException") {
            throw new Error("Invalid password");
        } else if (err.name === "InvalidParameterException") {
            throw new Error("Invalid parameters");
        }

        throw new Error("Error creating user");
    }
}

async function login_user(data, username) {

    try {
        // Authenticate the user with Cognito
        const params = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: clientId,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: data.password,
            },
        };

        const command = new InitiateAuthCommand(params);
        const response = await cognitoClient.send(command);

        // If authentication is successful, return the token
        const token = response.AuthenticationResult.IdToken;
        return new Token(token, username);
    } catch (err) {
        console.error("Error logging in user with Cognito:", err);

        // Handle specific Cognito errors
        if (err.name === "NotAuthorizedException") {
            return badRequest("Invalid username or password");
        } else if (err.name === "UserNotFoundException") {
            return badRequest("User not found");
        }

        throw new Error("Error logging in user");
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

        if (e.body) {
            e.body = JSON.parse(e.body);
        }

        let username = undefined;
        let pathParameters = {};

        try {
            username = e.requestContext.authorizer.lambda.username;
        } catch (error) {
            console.log('e, requestContext', e.requestContext);
            console.error('Error getting username from authorizer:', error);
        }


        try {
            pathParameters = e.pathParameters;

            // remove newlines from path parameters ???
            if (pathParameters) {
                Object.keys(pathParameters).forEach(key => {
                    pathParameters[key] = pathParameters[key].replace(/(\r\n|\n|\r)/gm, '');
                });
            }

        } catch (error) {
            console.log('Error getting path parameters:', error);
        }

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
            if (!username) { return badRequest('Invalid authentication'); }
            const world = await dynamo_create(e.body, World, username);
            // Return world
            return {
                statusCode: 200,
                body: JSON.stringify(world)
            };
        }
        // /signup: POST 
        else if (operation === 'POST' && path === '/signup') {
            // Check if user already exists
            const userExists = await dynamo_get_id(User, e.body.username, '', userTable);
            if (userExists) {
                return badRequest('User already exists');
            }
            console.log('Creating user: ', e.body.username, ' with email: ', e.body.email);
            // Create user
            const token = await create_user(e.body, e.body.username);
            // Return token
            return {
                statusCode: 200,
                body: JSON.stringify(token)
            };

        }
        // /login: POST
        else if (operation === 'POST' && path === '/login') {
            // Login user
            const token = await login_user(e.body, e.body.username);
            return {
                statusCode: 200,
                body: JSON.stringify(token)
            };
        }
        // /users: GET
        else if (operation === 'GET' && path === '/users') {
            // Get all users, paginated with limit and offset
            if (!username) { return badRequest('Invalid authentication'); }

            const users = await dynamo_get_all(User);
            return {
                statusCode: 200,
                body: JSON.stringify(users)
            };
        }
        // /users/{username}: GET, POST, DELETE
        else if (operation === 'GET' && path.startsWith('/users/')) {
            // Get user by ID
            if (!username) { return badRequest('Invalid authentication'); }
            console.log('username', username, 'table', userTable);
            let user = await dynamo_get_id(User, username, '', userTable);
            if (!user) {
                return notFound('User not found');
            }
            // remove password from user
            delete user.password;

            return {
                statusCode: 200,
                body: JSON.stringify(user)
            };
        }
        else if (operation === 'POST' && path.startsWith('/users/')) {
            // Update user by ID
            if (!username) { return badRequest('Invalid authentication'); }

            const updatedUser = await dynamo_update(User, e.body, username);
            // Return updated user
            return {
                statusCode: 200,
                body: JSON.stringify(updatedUser)
            };
        }
        else if (operation === 'DELETE' && path.startsWith('/users/')) {
            // Delete user by ID
            if (!username) { return badRequest('Invalid authentication'); }

            const deletedUser = await dynamo_delete(User, username, username);
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
            if (!username) { return badRequest('Invalid authentication'); }

            return notImplemented('Resources not implemented');
        }

        let pathsplit = path.split('/');
        // /{WorldId}: GET, POST, PUT, DELETE
        if (pathsplit.length === 2) {
            const worldId = pathParameters.WorldId;
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
                if (!username) { return badRequest('Invalid authentication'); }


                const world = await dynamo_update(World, e.body, username);

                // Return updated world
                return {
                    statusCode: 200,
                    body: JSON.stringify(world)
                };
            } else if (operation === 'PUT') {
                // Create a collection
                if (!username) { return badRequest('Invalid authentication'); }

                e.body.worldId = worldId;
                const collection = await dynamo_create(e.body, Collection, username, worldId, e.body.parentId);
                // Return collection
                return {
                    statusCode: 200,
                    body: JSON.stringify(collection)
                };
            } else if (operation === 'DELETE') {
                // Delete world by ID
                if (!username) { return badRequest('Invalid authentication'); }


                const world = await dynamo_delete(World, worldId, username);
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
            const worldId = pathParameters.WorldId;
            const collectionId = pathParameters.CollectionId;
            if (operation === 'GET') {
                // Get collection by ID
                const collection = await dynamo_get_id(Collection, collectionId, worldId);
                if (!collection) {
                    return notFound('Collection not found');
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(collection)
                };
            } else if (operation === 'POST') {
                // Update collection by ID
                if (!username) { return badRequest('Invalid authentication'); }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;

                const collection = await dynamo_update(Collection, e.body, username, worldId);
                if (!collection) {
                    return notFound('Collection not found');
                }
                // Return updated collection
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedCollection)
                };
            } else if (operation === 'PUT') {
                // Create an entry
                if (!username) { return badRequest('Invalid authentication'); }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;

                const entry = await dynamo_create(e.body, Entry, username, worldId, collectionId);
                // Return entry
                return {
                    statusCode: 200,
                    body: JSON.stringify(entry)
                };
            } else if (operation === 'DELETE') {
                // Delete collection by ID
                if (!username) { return badRequest('Invalid authentication'); }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;

                const collection = await dynamo_delete(Collection, collectionId, username, worldId);
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
            const worldId = pathParameters.WorldId;
            const collectionId = pathParameters.CollectionId;
            const entryId = pathParameters.EntryId;
            if (operation === 'GET') {
                // Get entry by ID
                const entry = await dynamo_get_id(Entry, entryId, worldId);
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
                if (!username) { return badRequest('Invalid authentication'); }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;
                e.body.entryId = entryId;

                const entry = await dynamo_update(Entry, e.body, username, worldId);
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
                if (!username) { return badRequest('Invalid authentication'); }

                e.body.worldId = worldId;
                e.body.collectionId = collectionId;
                e.body.entryId = entryId;

                const entry = await dynamo_delete(Entry, entryId, username, worldId);
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
    } catch (err) {
        console.error("Error processing request:", err);
        // if error is Item already exists, return 409
        if (err.message === 'Item already exists') {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: err.message })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: err.message })
        };
    }
}