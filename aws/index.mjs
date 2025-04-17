
import {
    DynamoDBDocumentClient, PutCommand, GetCommand,
    UpdateCommand, DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client();
const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (e) => {

    function notImplemented(name) {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: `${name} not implemented` })
        };
    }

    try {
        // Define the name of the DDB table to perform the CRUD operations on
        const tablename = "lorelibrary";
        const operation = e.http.method;
        const path = e.rawPath;

        console.log('Event:', JSON.stringify(event, null, 2), 'Operation:', operation, 'Path:', path);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Hello from Lambda! Got operation: ${operation} on path: ${path} from event: ${JSON.stringify(e)}` })
        }


        //  if (operation == 'echo'){
        //       return(event.payload);
        //  }

        // else { 
        //     event.payload.TableName = tablename;
        //     let response;

        //     switch (operation) {
        //       case 'create':
        //            response = await ddbDocClient.send(new PutCommand(event.payload));
        //            break;
        //       case 'read':
        //            response = await ddbDocClient.send(new GetCommand(event.payload));
        //            break;
        //       case 'update':
        //            response = ddbDocClient.send(new UpdateCommand(event.payload));
        //            break;
        //       case 'delete':
        //            response = ddbDocClient.send(new DeleteCommand(event.payload));
        //            break;
        //       default:
        //         response = 'Unknown operation: ${operation}';
        //       }
        //     console.log(context);
        //     console.log(response);
        //     return response;
        // }

        if (path === '/users' && operation == 'read') {
            return notImplemented('Get users');
        }

        if (path === '/users' && operation == 'create') {
            const { userId, password } = JSON.parse(body);
            return notImplemented(`Register user: ${result}`);
        }

        if (path.startsWith('/users/') && operation == 'read') {
            const { userId } = pathParameters;
            return notImplemented(`Get user details for ${userId}`);
        }

        if (path.startsWith('/users/') && operation == 'update') {
            const { userId } = pathParameters;
            const userDetails = JSON.parse(body);
            return notImplemented(`Update user details for ${userId}`);
        }

        if (path.startsWith('/users/') && operation == 'delete') {
            const { userId } = pathParameters;
            return notImplemented(`Delete user ${userId}`);
        }

        if (path === '/worlds' && operation == 'read') {
            const userId = queryStringParameters.userId; // Assuming userId is passed as a query parameter
            return notImplemented(`Get worlds for user ${userId}`);
        }

        if (path === '/worlds' && operation == 'create') {
            const { worldId, userId } = JSON.parse(body);
            return notImplemented(`Create world ${worldId} for user ${userId}`);
        }

        if (path.startsWith('/worlds/') && operation == 'read') {
            const { worldId } = pathParameters;
            return notImplemented(`Get world details for ${worldId}`);
        }

        if (path.startsWith('/worlds/') && operation == 'update') {
            const { worldId } = pathParameters;
            const worldDetails = JSON.parse(body);
            return notImplemented(`Update world details for ${worldId}`);
        }

        if (path.startsWith('/worlds/') && operation == 'delete') {
            const { worldId } = pathParameters;
            return notImplemented(`Delete world ${worldId}`);
        }

        if (path.startsWith('/worlds/') && path.endsWith('/collections') && operation == 'read') {
            const { worldId } = pathParameters;
            const userId = queryStringParameters.userId;
            return notImplemented(`Get collections for world ${worldId} and user ${userId}`);
        }

        if (path.startsWith('/worlds/') && path.endsWith('/collections') && operation == 'create') {
            const { worldId } = pathParameters;
            const { collectionId, userId } = JSON.parse(body);
            return notImplemented(`Create collection ${collectionId} for world ${worldId} and user ${userId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && operation == 'read') {
            const { worldId, collectionId } = pathParameters;
            return notImplemented(`Get collection details for world ${worldId} and collection ${collectionId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && operation == 'update') {
            const { worldId, collectionId } = pathParameters;
            const collectionDetails = JSON.parse(body);
            // Mock implementation for updating collection details
            return notImplemented(`Update collection details for world ${worldId} and collection ${collectionDetails}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/collections/') && operation == 'delete') {
            const { worldId, collectionId } = pathParameters;
            return notImplemented(`Delete collection ${collectionId} for world ${worldId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/entries') && operation == 'read') {
            const { worldId, collectionId } = pathParameters;
            return notImplemented(`Get entries for world ${worldId} and collection ${collectionId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/entries') && operation == 'create') {
            const { worldId, collectionId } = pathParameters;
            const { entryId, userId, content } = JSON.parse(body);
            return notImplemented(`Create entry ${entryId} for world ${worldId}, collection ${collectionId}, and user ${userId}`);
        }

        if (path.startsWith('/worlds/') && path.includes('/resources') && operation == 'create') {
            const { worldId } = pathParameters;
            const { resourceId, fileContent, fileType, userId } = JSON.parse(body);
            return notImplemented(`Upload resource ${resourceId} for world ${worldId} and user ${userId}`);
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