import { badRequest, notImplemented } from './utilities.mjs';

import { User, DataShort, Entry, Collection, World } from './classes.mjs';

import { dynamo_get, dynamo_create, dynamo_list, crud } from './dynamo.mjs';

import { create_user, login_user } from './cognito.mjs';

import { s3_crud } from './s3.mjs';

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
            console.log('No auth from authorizer:', error);
        }

        try {
            pathParameters = e.pathParameters;

            // remove newlines from path parameters ???
            if (pathParameters && typeof pathParameters === 'object') {
                Object.keys(pathParameters).forEach(key => {
                    pathParameters[key] = pathParameters[key].replace(/(\r\n|\n|\r)/gm, '');
                });
            }

        } catch (error) {
            console.log('Error getting path parameters:', error);
        }

        // /worlds: GET, PUT
        if (operation === 'GET' && path === '/worlds') {
            // Get all worlds, FIX: paginated with limit and offset
            const worlds = await dynamo_list(World)
            return {
                statusCode: 200,
                body: JSON.stringify(worlds)
            };
        }
        else if (operation === 'PUT' && path === '/worlds') {
            // Create a new world
            if (!username) { return badRequest('Invalid authentication'); }
            
            e.body.parentId = username; 
            e.body.ownerId = username; 
            var data = World.verify(e.body);
            
            if (data === null) { return badRequest('Invalid world data'); }

            const world = await dynamo_create(data);
            // Return world
            return {
                statusCode: 200,
                body: JSON.stringify(world)
            };
        }
        // /signup: POST 
        else if (operation === 'POST' && path === '/signup') {
            // Check if user already exists
            var data = User.verify(e.body);
            if (data === null) { return badRequest('Invalid user data'); }

            try {
                const userExists = await dynamo_get(data, process.env.USER_TABLE); // Users are in a different table than default
                if (userExists) {
                    return badRequest('User already exists');
                }
            } catch (error) {
                // User does not exist, so we can create it
                console.log('User does not exist, creating user');
            }

            console.log('Creating user: ', e.body.username, ' with email: ', e.body.email);
            const token = await create_user(e.body);
            return token;

        }
        // /login: POST
        else if (operation === 'POST' && path === '/login') {
            const token = await login_user(e.body);
            return token;
        }

        let pathsplit = path.split('/');

        // NOT IMPLEMENTED
        // /search: anything at all related to search
        if (pathsplit[1] === 'search') {
            return notImplemented('Search not implemented');
        }
        // /users: GET, PUT, DELETE
        else if (pathsplit[1] === 'users') {
            // if no path split[2], and operation is GET, return all users
            if (pathsplit.length === 2 && operation === 'GET') {
                if (!username) { return badRequest('Invalid authentication'); }

                var res = await dynamo_list(User);
                if (res) {
                    return res;
                }
            }
            const user = pathsplit[2];
            e.body.user = user;
            var res = await crud(operation, User, e.body, username);
            if (res) {
                return res;
            }
        } 
        // /resources: anything at all related to resources (images, files, etc)
        else if (pathsplit[1] === 'resources') {
            e.body.path = path;
            var res = await s3_crud(path, operation, e.body, username);
            if (res) {
                return res;
            }
        }

        // /{WorldId}: GET, POST, PUT, DELETE
        if (pathsplit.length === 2) {
            const worldId = pathParameters.WorldId;
            e.body.name = worldId;
            e.body.worldId = worldId;
            e.body.parentId = username;
            var res = await crud(operation, World, e.body, username);
            if (res) {
                return res;
            }
        }
        // /{WorldId}/{CollectionId}: GET, POST, PUT DELETE
        else if (pathsplit.length === 3) {
            const worldId = pathParameters.WorldId;
            const collectionId = pathParameters.CollectionId;
            e.body.name = collectionId;
            e.body.worldId = worldId;
            var res = await crud(operation, Collection, e.body, username);
            if (res) {
                return res;
            }
        }
        // /{WorldId}/{CollectionId}/{EntryId}: GET, POST, DELETE
        else if (pathsplit.length === 4) {
            const worldId = pathParameters.WorldId;
            const collectionId = pathParameters.CollectionId;
            const entryId = pathParameters.EntryId;
            e.body.name = entryId;
            e.body.parentId = collectionId;
            e.body.worldId = worldId;
            var res = await crud(operation, Entry, e.body, username);
            if (res) {
                return res;
            }
        }
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Route not found for: ' + operation + ' ' + path })
        };
    } catch (err) {
        console.error("Error processing request:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err.message }) // Fix this in the future
        };
    }
}