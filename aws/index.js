const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login, createWorld, createCollection, addEntry, getWorlds, getCollections, getEntries, uploadResource } = require('./handlers'); // Assuming handlers are in a separate file

exports.handler = async (event) => {
    const { httpMethod, path, pathParameters, queryStringParameters, body } = event;

    try {
        if (path === '/users' && httpMethod === 'GET') {
            // Get a list of users (mock implementation, as no function exists for this)
            return {
                statusCode: 200,
                body: JSON.stringify([]) // Replace with actual implementation
            };
        }

        if (path === '/users' && httpMethod === 'POST') {
            const { userId, password } = JSON.parse(body);
            const result = await register(userId, password);
            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        }

        if (path.startsWith('/users/') && httpMethod === 'GET') {
            const { userId } = pathParameters;
            // Mock implementation for getting user details
            return {
                statusCode: 200,
                body: JSON.stringify({ userId }) // Replace with actual implementation
            };
        }

        if (path.startsWith('/users/') && httpMethod === 'PATCH') {
            const { userId } = pathParameters;
            const userDetails = JSON.parse(body);
            // Mock implementation for updating user details
            return {
                statusCode: 200,
                body: JSON.stringify({ userId, ...userDetails }) // Replace with actual implementation
            };
        }

        if (path.startsWith('/users/') && httpMethod === 'DELETE') {
            const { userId } = pathParameters;
            // Mock implementation for deleting a user
            return {
                statusCode: 204,
                body: ''
            };
        }

        if (path === '/worlds' && httpMethod === 'GET') {
            const userId = queryStringParameters.userId; // Assuming userId is passed as a query parameter
            const worlds = await getWorlds(userId);
            return {
                statusCode: 200,
                body: JSON.stringify(worlds)
            };
        }

        if (path === '/worlds' && httpMethod === 'POST') {
            const { worldId, userId } = JSON.parse(body);
            const result = await createWorld(worldId, userId);
            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        }

        if (path.startsWith('/worlds/') && httpMethod === 'GET') {
            const { worldId } = pathParameters;
            // Mock implementation for getting world details
            return {
                statusCode: 200,
                body: JSON.stringify({ worldId }) // Replace with actual implementation
            };
        }

        if (path.startsWith('/worlds/') && httpMethod === 'PATCH') {
            const { worldId } = pathParameters;
            const worldDetails = JSON.parse(body);
            // Mock implementation for updating world details
            return {
                statusCode: 200,
                body: JSON.stringify({ worldId, ...worldDetails }) // Replace with actual implementation
            };
        }

        if (path.startsWith('/worlds/') && httpMethod === 'DELETE') {
            const { worldId } = pathParameters;
            // Mock implementation for deleting a world
            return {
                statusCode: 204,
                body: ''
            };
        }

        if (path.startsWith('/worlds/') && path.endsWith('/collections') && httpMethod === 'GET') {
            const { worldId } = pathParameters;
            const userId = queryStringParameters.userId; // Assuming userId is passed as a query parameter
            const collections = await getCollections(worldId, userId);
            return {
                statusCode: 200,
                body: JSON.stringify(collections)
            };
        }

        if (path.startsWith('/worlds/') && path.endsWith('/collections') && httpMethod === 'POST') {
            const { worldId } = pathParameters;
            const { collectionId, userId } = JSON.parse(body);
            const result = await createCollection(worldId, collectionId, userId);
            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && httpMethod === 'GET') {
            const { worldId, collectionId } = pathParameters;
            // Mock implementation for getting collection details
            return {
                statusCode: 200,
                body: JSON.stringify({ worldId, collectionId }) // Replace with actual implementation
            };
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && httpMethod === 'PATCH') {
            const { worldId, collectionId } = pathParameters;
            const collectionDetails = JSON.parse(body);
            // Mock implementation for updating collection details
            return {
                statusCode: 200,
                body: JSON.stringify({ worldId, collectionId, ...collectionDetails }) // Replace with actual implementation
            };
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && httpMethod === 'DELETE') {
            const { worldId, collectionId } = pathParameters;
            // Mock implementation for deleting a collection
            return {
                statusCode: 204,
                body: ''
            };
        }

        if (path.startsWith('/worlds/') && path.includes('/entries') && httpMethod === 'GET') {
            const { worldId, collectionId } = pathParameters;
            const entries = await getEntries(worldId, collectionId, queryStringParameters.userId);
            return {
                statusCode: 200,
                body: JSON.stringify(entries)
            };
        }

        if (path.startsWith('/worlds/') && path.includes('/entries') && httpMethod === 'POST') {
            const { worldId, collectionId } = pathParameters;
            const { entryId, userId, content } = JSON.parse(body);
            const result = await addEntry(worldId, collectionId, entryId, userId, content);
            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        }

        if (path.startsWith('/worlds/') && path.includes('/resources') && httpMethod === 'POST') {
            const { worldId } = pathParameters;
            const { resourceId, fileContent, fileType, userId } = JSON.parse(body);
            const result = await uploadResource(worldId, userId, resourceId, fileContent, fileType);
            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Route not found' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};