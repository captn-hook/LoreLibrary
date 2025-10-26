import { badRequest, notImplemented } from './utilities.mjs';

import { User, Entry, Collection, World } from './classes.mjs';

import { dynamo_get, dynamo_create, dynamo_list, dynamo_get_map, crud, dynamo_find_collection } from './dynamo.mjs';

import { create_user, login_user } from './cognito.mjs';

import { s3_crud } from './s3.mjs';

const reserved_names = ['world', 'worlds', 'users', 'user', 'resource', 'resources', 'search', 'signup', 'login', 'logout', 'auth', 'authenticate', 'collections', 'collection', 'entries', 'entry'];

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
            console.log('Event body:', e.body);
            e.body = JSON.parse(e.body);
        }

        let username = undefined;
        let pathParameters = {};

        try {
            if (e.requestContext.authorizer && e.requestContext.authorizer.lambda) {
                username = e.requestContext.authorizer.lambda.username;
            } else {
                console.error('No auth from authorizer');
            }
        } catch (error) {
            throw new Error('Authorizer error: ' + error.message);
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
            console.error('Error getting path parameters:', error);
        }

        // /worlds: GET, PUT
        if (operation === 'GET' && path === '/worlds') {
            // Get all worlds, FIX: paginated with limit and offset
            var res = await dynamo_list(World)
            if (res) {
                return res;
            }
        }
        else if (operation === 'PUT' && path === '/worlds') {
            // Create a new world
            if (!username) { return badRequest('Invalid authentication'); }

            // reserved names
            if (reserved_names.includes(e.body.name)) {
                return badRequest('Invalid world name: ' + e.body.name + '. Reserved names cannot be used.');
            }

            e.body.parentId = username;
            e.body.ownerId = username;
            e.body.worldId = e.body.name? e.body.name : username;
            var data = World.verify(e.body);

            if (data === null) { return badRequest('Invalid world data'); }


            var res = await dynamo_create(data);
            // Return world
            if (res) {
                return res;
            }
        }
        // /signup: POST 
        else if (operation === 'POST' && path === '/signup') {
            // Check if user already exists
            var data = User.verify(e.body);
            if (data === null) { return badRequest('Invalid user data'); }

            try {
                const userExists = await dynamo_get(data, process.env.USER_TABLE); // Users are in a different table than default
                if (userExists.statusCode === 404) {
                    const token = await create_user(e.body);
                    return token;
                } else if (userExists.statusCode === 200) {
                    return badRequest('User already exists');
                } else {
                    console.error('Error checking user existence:', userExists);
                    return { 
                        statusCode: 500,
                        body: JSON.stringify({ message: 'Error checking user existence' })
                    };
                }
            } catch (error) {
                console.error('Error checking user existence:', error);
                return { 
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Error checking user existence' })
                };
            }

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
            const user = pathParameters.username;
            if (!e.body) {
                e.body = {};
            }
            e.body.username = user;
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

        console.log('matching to path length: ' + pathsplit.length + ' with operation: ' + operation);
        for (const p of pathsplit) {
            console.log(' - ' + p);
        }

        // /{WorldId}: GET, POST, PUT, DELETE
        if (pathsplit.length === 2) {
            const worldId = pathParameters.WorldId;
            // reserved names
            if (reserved_names.includes(worldId)) {
                return badRequest('Invalid world name: ' + worldId + '. Reserved names cannot be used.');
            }

            if (!e.body) {
                e.body = {};
            }
            e.body.worldId = worldId;
            if (operation === 'PUT') {
                if (!username) { return badRequest('Invalid authentication'); }

                if (reserved_names.includes(e.body.name)) {
                    return badRequest('Invalid world name: ' + e.body.name + '. Reserved names cannot be used.');
                }

                // Try to get the type of the put object
                // if the body contains a collections field, then it is a collection
                if (e.body.collections && Array.isArray(e.body.collections)) {

                    // Creating a collection
                    e.body.worldId = worldId;
                    e.body.ownerId = username? username : null;
                    e.body.parentId = worldId; // worlds are their own parent

                    var res = await crud(operation, Collection, e.body, username);
                    if (res) {
                        return res;
                    }
                } else { 
                    // Creating an entry
                    e.body.worldId = worldId;
                    e.body.ownerId = username? username : null;
                    e.body.parentId = worldId; // worlds are their own parent

                    var res = await crud(operation, Entry, e.body, username);
                    if (res) {
                        return res;
                    }

                }

            // check for query parameters
            } else if (operation === 'GET' && e.queryStringParameters && e.queryStringParameters.map && e.queryStringParameters.map === 'true') {
                // Get world as a map
                var res = await dynamo_get_map(worldId);
                if (res) {
                    return res;
                }
            } else {
                e.body.name = worldId;
                e.body.parentId = username? username : null;
                var res = await crud(operation, World, e.body, username);
                if (res) {
                    return res;
                }
            }
        }
        // /{WorldId}/{Id}: GET, POST, PUT DELETE
        else if (pathsplit.length === 3) {
            const worldId = pathParameters.WorldId;
            const Id = pathParameters.Id;

            // reserved names
            if (reserved_names.includes(Id)) {
                return badRequest('Invalid collection or entry name: ' + Id + '. Reserved names cannot be used.');
            }
            if (reserved_names.includes(worldId)) {
                return badRequest('Invalid world name: ' + worldId + '. Reserved names cannot be used.');
            }

            // Parent id will be in the query if present
            let parentId;
            if (e.queryStringParameters && e.queryStringParameters.parentId) {
                parentId = e.queryStringParameters.parentId;
            } else if (e.body && e.body.parentId) {
                parentId = e.body.parentId;
            } else {
                parentId = worldId; // Default to worldId if no parentId is provided
            }
            if (!e.body) {
                e.body = {};
            }
            e.body.worldId = worldId;
            
            if (operation === 'PUT') {
                // Creating an entry or collection
                if (!username) { return badRequest('Invalid authentication'); }
                if (e.body.collections && Array.isArray(e.body.collections)) {
                    // Creating a collection
                    e.body.worldId = worldId;
                    e.body.ownerId = username;
                    e.body.parentId = Id;
                    
                    if (reserved_names.includes(e.body.name)) {
                        return badRequest('Invalid collection name: ' + e.body.name + '. Reserved names cannot be used.');
                    }

                    var res = await crud(operation, Collection, e.body, username);
                    if (res) {
                        return res;
                    }
                } else {
                    // Creating an entry
                    e.body.worldId = worldId;
                    e.body.ownerId = username;
                    e.body.parentId = Id; // Use Id as parentId
                    console.log('Creating entry /' + worldId + '/' + Id + '/' + e.body.name );

                    if (reserved_names.includes(e.body.name)) {
                        return badRequest('Invalid entry name: ' + e.body.name + '. Reserved names cannot be used.');
                    }

                    var res = await crud(operation, Entry, e.body, username);
                    if (res) {
                        return res;
                    }
                }
            } else {
                if (await dynamo_find_collection(worldId, Id)) {
                    console.log('Found collection with id: ' + Id);
                    const collectionId = Id;
                    e.body.name = collectionId;
                    // parentid will be in query, or use worldId as parentId
                    e.body.parentId = parentId; 
                    var res = await crud(operation, Collection, e.body, username);
                    if (res) {
                        return res;
                    }
                } else {
                    console.log('No collection found with id: ' + Id + ', treating as entry');
                    const entryId = Id;
                    e.body.name = entryId;
                    e.body.parentId = parentId; // Use parentId from query or body, or default to worldId
                    var res = await crud(operation, Entry, e.body, username);
                    if (res) {
                        return res;
                    }
                }
            }
        }
        // /{WorldId}/{CollectionId}/{EntryId}: GET, POST, DELETE
        else if (pathsplit.length === 4) {
            console.log('Matched pathsplit length 4: ' + pathsplit.join('/'));
            const worldId = pathParameters.WorldId;
            const collectionId = pathParameters.CollectionId;
            const entryId = pathParameters.EntryId;

            // reserved names
            if (reserved_names.includes(entryId)) {
                return badRequest('Invalid entry name: ' + entryId + '. Reserved names cannot be used.');
            }
            if (reserved_names.includes(collectionId)) {
                return badRequest('Invalid collection name: ' + collectionId + '. Reserved names cannot be used.');
            }
            if (reserved_names.includes(worldId)) {
                return badRequest('Invalid world name: ' + worldId + '. Reserved names cannot be used.');
            }

            if (!e.body) {
                e.body = {};
            }
            e.body.worldId = worldId;
            e.body.name = entryId;
            e.body.parentId = collectionId;
            var res = await crud(operation, Entry, e.body, username);
            console.log('crud operation result:', res);
            if (res) {
                return res;
            }
        }
        console.error('No route found for: ' + operation + ' ' + path + ' with body: ' + JSON.stringify(e.body));
        console.error('Path parameters:', pathParameters, 'pathsplit length:', pathsplit.length);
        console.error('pathsplit is 4???', pathsplit.length === 4);
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