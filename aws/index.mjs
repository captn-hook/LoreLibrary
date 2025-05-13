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

import { badRequest, notFound, notImplemented } from './utilities.mjs';

import { SignUp, Token, User, Permissions, DataShort, Entry, Collection, World } from './classes.mjs';

import { dynamo_create, dynamo_get, dynamo_list, dynamo_update, dynamo_delete } from './dynamo.mjs';

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const s3Client = new S3Client();
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const userTable = process.env.USER_TABLE;
const dataTable = process.env.DATA_TABLE;

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