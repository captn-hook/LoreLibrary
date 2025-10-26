import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";

import { badRequest } from "../utilities.js";
import { World, Collection, Entry, User, DModel, Model } from "../classes.ts";

import { dynamo_delete } from "./delete.ts";
import { dynamo_create } from "./create.ts"
import { dynamo_get } from "./get.ts";
import { dynamo_list } from "./list.ts";
import { dynamo_update } from "./update.ts";

import { dynamo_user_create } from "./user_create.ts";
import { dynamo_find_collection } from "./find_collection.ts";
import { dynamo_get_map } from "./get_map.ts";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });

export const dataTable = process.env.DATA_TABLE;
export const userTable = process.env.USER_TABLE;

export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export function make_entry(item: any): Entry | null {
    try {
        let content = Array.isArray(item.content) ? item.content : [item.content];
        return new Entry(
            String(item.SK),
            String(item.worldId),
            String(item.collectionId),
            content
        );
    } catch (error) {
        console.error("Error creating Entry:", error);
        return null;
    }
}

export function make_collection(item: any): Collection | null {
    try {
        let entries = Array.isArray(item.entries) ? item.entries : [item.entries];
        let collections = Array.isArray(item.collections) ? item.collections : [item.collections];
        return new Collection(
            String(item.SK),
            String(item.worldId),
            String(item.parentId),
            entries,
            collections
        );
    } catch (error) {
        console.error("Error creating Collection:", error);
        return null;
    }
}

export function make_world(item: any): World | null {
    try {
        let entries = Array.isArray(item.entries) ? item.entries : [item.entries];
        let collections = Array.isArray(item.collections) ? item.collections : [item.collections];
        return new World(
            String(item.SK),
            String(item.parentId),
            String(item.worldId ? item.worldId : item.SK),
            entries,
            collections
        );
    } catch (error) {
        console.error("Error creating World:", error);
        return null;
    }
}

export function make_user(item: any): User | null {
    try {
        let content = Array.isArray(item.content) ? item.content : [item.content];
        let worlds = Array.isArray(item.worlds) ? item.worlds : [item.worlds];
        return new User(
            String(item.SK),
            content,
            worlds
        );
    } catch (error) {
        console.error("Error creating User:", error);
        return null;
    }
}

export function make<M extends typeof World | typeof Collection | typeof Entry | typeof User>(
  item: any,
  model: M
): InstanceType<M> | null {
  if (model === World) {
    return make_world(item) as InstanceType<M>;
  } else if (model === Collection) {
    return make_collection(item) as InstanceType<M>;
  } else if (model === Entry) {
    return make_entry(item) as InstanceType<M>;
  } else if (model === User) {
    return make_user(item) as InstanceType<M>;
  } else {
    console.error("Invalid model:", model);
    return null;
  }
}

export function crud(operation: string, model: Model, body: any, username: string) {
    var table;
    if (model == User) {
        table = userTable;
        if (operation === 'GET' && body.username !== username) {
            return dynamo_get(new User(body.username), table);
        }
    } else {
        table = dataTable;
    }

    console.log(`Performing crud ${operation} on ${model.name} with body:`, body, "by", username);

    switch (operation) {
        case 'POST':
            if (!username) { return badRequest('Invalid authentication'); }
            if (model === User) {
                return badRequest('Use /signup to create a new user'); 
            } else if (model === World || model === Collection || model === Entry) {
                return dynamo_update(body, model, table);
            } else {
                throw new Error('Invalid model in POST');
            }
        case 'GET':
            if (model === User && !username) { return badRequest('Invalid authentication'); }

            if (!body) {
                body = {};
            } else if (!body.parentId) {
                body.parentId = null;
            } else if (!body.worldId) {
                body.worldId = null;
            }

            let gd;
            if (model === User) {
                gd = User.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else if (model === World) {
                gd = World.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else if (model === Collection) {
                gd = Collection.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else if (model === Entry) {
                gd = Entry.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else {
                console.error('Invalid model:', model);
                return badRequest('Invalid model');
            }
            return dynamo_get(gd, table);
        case 'PUT':
            if (!username) { return badRequest('Invalid authentication'); }

            let pd = model.verify(body);
            if (pd === null) {
                return badRequest('Invalid body');
            }
            if (pd instanceof User) {
                return badRequest('Use /signup to create a new user');
            } else if (pd instanceof World || pd instanceof Collection || pd instanceof Entry) {
                return dynamo_create(pd, table);
            } else {
                throw new Error('Invalid model in POST');
            }
        case 'DELETE':
            if (!username) { return badRequest('Invalid authentication'); }

            let dd = model.verify(body);

            // display the type of the data
            console.log("Deleting item of type:", dd.constructor.name);

            if (dd instanceof User) {
                throw new Error('DELETE user not implemented');
            } else if (dd instanceof World || dd instanceof Collection || dd instanceof Entry) {
                return dynamo_delete(dd);
            } else {
                throw new Error('Invalid model in DELETE');
            }
        default:
            throw new Error('Invalid operation');
    }
}

export async function get_sub_items(worldId: string, collectionName: string) {
    // Get all sub items of a collection
    let r = await dynamo_get(new Collection(collectionName, collectionName, worldId), dataTable, false);
    let thisCollection = make_collection(r.body);
    if (!thisCollection || !thisCollection['entries'] && !thisCollection['collections']) {
        console.error("Collection not found or empty:", collectionName);
        return {};
    }
    let res: any = {};
    if (thisCollection['entries']) {
        res['entries'] = thisCollection['entries'];
    }
    if (thisCollection['collections']) {
        for (const subCollectionName of thisCollection['collections']) {
            res[subCollectionName] = await get_sub_items(worldId, subCollectionName);
        }
    }
    return res;
}

export async function get_style(parentId: string, worldId: string) {
    // Get the style data for a world or collection 
    try {
        try {
            let parent = await JSON.parse((await dynamo_get(new Collection(parentId, null, worldId), dataTable)).body)
            parent = Collection.verify(parent);
            if (parent && parent.style !== '') {
                return parent.style;
            } else {
                // If no style is found, return a default style or an empty object
                return get_style(parent.parentId, worldId);
            }
        } catch (err) {
            // try to get the style from the world
            let world = await JSON.parse((await dynamo_get(new World(worldId), dataTable)).body);
            world = World.verify(world);
            if (world && world.style) {
                return world.style;
            } else {
                // If no style is found, return a default style or an empty object
                return '';
            }
        }
    } catch (err) {
        console.error("Error getting style:", err);
        return ''; // Return an empty string or a default style if an error occurs
    }
}





export {
    dynamo_get,
    dynamo_list,
    dynamo_create,
    dynamo_update,
    dynamo_delete,
    dynamo_user_create,
    dynamo_get_map,
    dynamo_find_collection
};