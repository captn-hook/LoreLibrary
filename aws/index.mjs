
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

        if (path === '/users' && operation == 'GET') {
            return notImplemented('Get users');
        }

        if (path === '/users' && operation == 'POST') {
            const { userId, password } = JSON.parse(body);
            return notImplemented(`Register user: ${result}`);
        }

        if (path.startsWith('/users/') && operation == 'GET') {
            const { userId } = pathParameters;
            return notImplemented(`Get user details for ${userId}`);
        }

        if (path.startsWith('/users/') && operation == 'PATCH') {
            const { userId } = pathParameters;
            const userDetails = JSON.parse(body);
            return notImplemented(`Update user details for ${userId}`);
        }

        if (path.startsWith('/users/') && operation == 'DELETE') {
            const { userId } = pathParameters;
            return notImplemented(`Delete user ${userId}`);
        }

        if (path === '/worlds' && operation == 'GET') {
            const userId = queryStringParameters.userId;
            return notImplemented(`Get worlds for user ${userId}`);
        }

        if (path === '/worlds' && operation == 'POST') {
            const { worldId, userId } = JSON.parse(body);
            return notImplemented(`Create world ${worldId} for user ${userId}`);
        }

        if (path.startsWith('/worlds/') && operation == 'GET') {
            const { worldId } = pathParameters;
            return notImplemented(`Get world details for ${worldId}`);
        }

        if (path.startsWith('/worlds/') && operation == 'PATCH') {
            const { worldId } = pathParameters;
            const worldDetails = JSON.parse(body);
            return notImplemented(`Update world details for ${worldId}`);
        }

        if (path.startsWith('/worlds/') && operation == 'DELETE') {
            const { worldId } = pathParameters;
            return notImplemented(`Delete world ${worldId}`);
        }

        if (path.startsWith('/worlds/') && path.endsWith('/collections') && operation == 'GET') {
            const { worldId } = pathParameters;
            const userId = queryStringParameters.userId;
            return notImplemented(`Get collections for world ${worldId} and user ${userId}`);
        }

        if (path.startsWith('/worlds/') && path.endsWith('/collections') && operation == 'POST') {
            const { worldId } = pathParameters;
            const { collectionId, userId } = JSON.parse(body);
            return notImplemented(`Create collection ${collectionId} for world ${worldId} and user ${userId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && operation == 'GET') {
            const { worldId, collectionId } = pathParameters;
            return notImplemented(`Get collection details for world ${worldId} and collection ${collectionId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && operation == 'PATCH') {
            const { worldId, collectionId } = pathParameters;
            const collectionDetails = JSON.parse(body);
            return notImplemented(`Update collection details for world ${worldId} and collection ${collectionDetails}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && operation == 'DELETE') {
            const { worldId, collectionId } = pathParameters;
            return notImplemented(`Delete collection ${collectionId} for world ${worldId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/entries') && operation == 'GET') {
            const { worldId, collectionId } = pathParameters;
            return notImplemented(`Get entries for world ${worldId} and collection ${collectionId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/entries') && operation == 'POST') {
            const { worldId, collectionId } = pathParameters;
            const { entryId, userId, content } = JSON.parse(body);
            return notImplemented(`Create entry ${entryId} for world ${worldId}, collection ${collectionId}, and user ${userId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/resources') && operation == 'POST') {
            const { worldId } = pathParameters;
            const { resourceId, fileContent, fileType, userId } = JSON.parse(body);
            return notImplemented(`Upload resource ${resourceId} for world ${worldId} and user ${userId}`);
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