import { badRequest, notImplemented, notFound } from './utilities.ts';

import { User, Entry, Collection, World } from './classes.ts';

import { dynamo_get, dynamo_create, dynamo_list, dynamo_get_mapping, crud, dynamo_find_collection } from './dynamo/dynamo.ts';

import { create_user, login_user } from './cognito.ts';

import { s3_crud } from './s3.ts';

const reserved_names = ['world', 'worlds', 'users', 'user', 'resource', 'resources', 'search', 'signup', 'login', 'logout', 'auth', 'authenticate', 'collections', 'collection', 'entries', 'entry'];

export const handler = async (e: any) => {
    try {
        const [operation, path] = e.routeKey.split(' ');

        if (e.body) {
            e.body = JSON.parse(e.body);
        }

        console.log('Operation:', operation, 'Path:', path);

        let username: string | undefined = undefined;
        let pathParameters: Record<string, string> = {};

        try {
            if (e.requestContext.authorizer && e.requestContext.authorizer.lambda) {
                username = e.requestContext.authorizer.lambda.username;
            }
        } catch (error) {
            console.error('Error getting username from authorizer:', error);
            throw error;
        }

        try {
            pathParameters = e.pathParameters;
            if (pathParameters && typeof pathParameters === 'object') {
                Object.keys(pathParameters).forEach((key: string) => {
                    pathParameters[key] = pathParameters[key].replace(/(\r\n|\n|\r)/gm, '');
                });
            }
        } catch (error) {
            console.error('Error getting path parameters:', error);
        }

        // /signup: POST
        if (operation === 'POST' && path === '/signup') {
            let newdata;
            try {
                newdata = User.verify(e.body);
            } catch (err) {
                return badRequest('Invalid user data');
            }
            try {
                const userExists = await dynamo_get(newdata, process.env.USER_TABLE);
                if (userExists.statusCode === 404) {
                    return await create_user(e.body);
                } else if (userExists.statusCode === 200) {
                    return badRequest('User already exists');
                } else {
                    return { statusCode: 500, body: JSON.stringify({ message: 'Error checking user existence' }) };
                }
            } catch (error) {
                console.error('Error checking user existence:', error);
                return { statusCode: 500, body: JSON.stringify({ message: 'Error checking user existence' }) };
            }
        }

        // /login: POST
        if (operation === 'POST' && path === '/login') {
            return await login_user(e.body);
        }

        const pathsplit = path.split('/');

        // /search
        if (pathsplit[1] === 'search') {
            return notImplemented('Search not implemented');
        }

        // /users: GET list; /users/{username}: GET, PATCH, DELETE
        if (pathsplit[1] === 'users') {
            if (pathsplit.length === 2 && operation === 'GET') {
                if (!username) { return badRequest('Invalid authentication'); }
                const limit = e.queryStringParameters?.limit ? parseInt(e.queryStringParameters.limit) : undefined;
                const cursor = e.queryStringParameters?.cursor;
                return await dynamo_list(User, '', limit, cursor);
            }
            const user = pathParameters.username;
            if (!e.body) { e.body = {}; }
            e.body.username = user;
            return await crud(operation, User, e.body, username);
        }

        // /resources
        if (pathsplit[1] === 'resources') {
            e.body.path = path;
            return await s3_crud(path, operation, e.body, username);
        }

        // /worlds: GET list, POST create
        if (path === '/worlds') {
            if (operation === 'GET') {
                const limit = e.queryStringParameters?.limit ? parseInt(e.queryStringParameters.limit) : undefined;
                const cursor = e.queryStringParameters?.cursor;
                return await dynamo_list(World, '', limit, cursor);
            }
            if (operation === 'POST') {
                if (!username) { return badRequest('Invalid authentication'); }
                if (reserved_names.includes(e.body?.name)) {
                    return badRequest('Reserved name: ' + e.body.name);
                }
                e.body.parentId = username;
                e.body.ownerId = username;
                e.body.worldId = e.body.name ?? username;
                let data;
                try {
                    data = World.verify(e.body);
                } catch (err) {
                    return badRequest('Invalid world data');
                }
                return await dynamo_create(data);
            }
        }

        // /{WorldId}: GET, PATCH (update), DELETE
        if (pathsplit.length === 2) {
            const worldId = pathParameters.WorldId;
            if (reserved_names.includes(worldId)) {
                return badRequest('Reserved name: ' + worldId);
            }
            if (!e.body) { e.body = {}; }
            e.body.worldId = worldId;
            e.body.name = worldId;
            e.body.parentId = username ?? null;
            if (operation === 'GET' && e.queryStringParameters?.mapping === 'true') {
                return await dynamo_get_mapping(worldId);
            }
            return await crud(operation, World, e.body, username);
        }

        // /{WorldId}/{path+}: GET, POST (create), PATCH (update), DELETE
        // pathsplit.length === 3 because the route template is /{WorldId}/{path+}
        if (pathsplit.length === 3) {
            const worldId = pathParameters.WorldId;
            const rawPath: string = pathParameters['path'] ?? '';
            const segments = rawPath.split('/').filter(Boolean);
            const itemName = segments[segments.length - 1];
            // parent is the second-to-last segment, or worldId if item is at root depth
            const parentId = segments.length > 1 ? segments[segments.length - 2] : worldId;

            if (reserved_names.includes(worldId)) {
                return badRequest('Reserved name: ' + worldId);
            }
            for (const seg of segments) {
                if (reserved_names.includes(seg)) {
                    return badRequest('Reserved name: ' + seg);
                }
            }

            if (!e.body) { e.body = {}; }
            e.body.worldId = worldId;

            if (operation === 'POST') {
                // Create: URL path encodes both parent and the new item's name
                if (!username) { return badRequest('Invalid authentication'); }
                e.body.name = itemName;
                e.body.parentId = parentId;
                e.body.ownerId = username;
                const type = e.body.type;
                if (type === 'collection') {
                    return await crud('PUT', Collection, e.body, username);
                } else {
                    return await crud('PUT', Entry, e.body, username);
                }
            }

            // For GET, PATCH, DELETE: resolve whether item is a collection or entry
            const isCollection = await dynamo_find_collection(worldId, itemName);
            e.body.name = itemName;
            e.body.parentId = parentId;
            if (operation === 'GET' && e.queryStringParameters?.mapping === 'true' && isCollection) {
                return await dynamo_get_mapping(worldId, itemName);
            }
            const model = isCollection ? Collection : Entry;
            return await crud(operation, model, e.body, username);
        }

        console.error('No route found for:', operation, path);
        return notFound('Route not found: ' + operation + ' ' + path);

    } catch (err) {
        console.error("Error processing request:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: String(err) })
        };
    }
}
