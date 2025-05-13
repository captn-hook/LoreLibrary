import { badRequest, notFound, notImplemented } from './utilities.mjs';

import { SignUp, Token, User, Permissions, DataShort, Entry, Collection, World } from './classes.mjs';

import { dynamo_create, dynamo_list, crud } from './dynamo.mjs';

import { create_user, login_user, user_manage} from './cognito.mjs';


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
            const worlds = await dynamo_list(World)
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
        // /users: GET, PUT, DELETE
        else if (path === '/users') {
            if (!username) { return badRequest('Invalid authentication'); }
            var res = user_manage(operation, User, e.body, username);
            if (res) {
                return res;
            }
        }

        // NOT IMPLEMENTED
        // /search: anything at all related to search
        if (operation === 'GET' && path === '/search') {
            return notImplemented('Search not implemented');
        }

        let pathsplit = path.split('/');

        // /resources: anything at all related to resources (images, files, etc)
        if (pathsplit[1] === 'resources') {

            var res = s3_crud(path, operation, e.body, username);
            if (res) {
                return res;
            }
        }

        // /{WorldId}: GET, POST, PUT, DELETE
        if (pathsplit.length === 2) {
            const worldId = pathParameters.WorldId;
            var res = crud(operation, World, e.body, username, worldId);
            if (res) {
                return res;
            }
        }
        // /{WorldId}/{CollectionId}: GET, POST, PUT DELETE
        else if (pathsplit.length === 3) {
            const worldId = pathParameters.WorldId;
            const collectionId = pathParameters.CollectionId;
            var res = crud(operation, Collection, e.body, username, worldId, collectionId);
            if (res) {
                return res;
            }
        }
        // /{WorldId}/{CollectionId}/{EntryId}: GET, POST, DELETE
        else if (pathsplit.length === 4) {
            var res = crud(operation, Entry, e.body, username, pathParameters.WorldId, pathParameters.CollectionId);
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