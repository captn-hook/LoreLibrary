import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";

import { badRequest } from "../utilities.mjs";
import { World, Collection, Entry, User } from "../classes.mjs";

import { dynamo_delete } from "./delete.js";
import { dynamo_create } from "./create.js"
import { dynamo_get } from "./get.js";
import { dynamo_list } from "./list.js";
import { dynamo_update } from "./update.js";


import { dynamo_user_create } from "./user_create.js";
import { dynamo_find_collection } from "./find_collection.js";
import { dynamo_get_map } from "./get_map.js";


const ddbClient = new DynamoDBClient({ region: "us-west-2" });

export const dataTable = process.env.DATA_TABLE;
export const userTable = process.env.USER_TABLE;

export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export function dynamo_to_item(item, model) {
    if (model === User) {
        item.username = item.SK
    } else {
        if (model === World) {
            item.worldId = item.SK
        } else if (model === Collection) {
            if (!item.worldId) {
                item.worldId = item.PK.split('#')[0];
            }
            if (!item.parentId) {
                item.parentId = item.worldId;
            }
        } else if (model === Entry) {
            if (!item.worldId) {
                item.worldId = item.PK.split('#')[0];
            }
        }
        item.name = item.SK;
    }
    delete item.PK;
    delete item.SK;
    item = model.verify(item);
    if (item === null) {
        throw new Error("Invalid item data");
    } 
    console.log("Converted item:", item);
    return item;
}

export function crud(operation, model, body, username) {
    var table;
    if (model == User) {
        table = userTable;
        if (operation === 'GET' && body.username !== username) {
            return dynamo_get(new User(body.username), table);
        }
    } else {
        table = dataTable;
    }

    switch (operation) {
        case 'POST':
            if (!username) { return badRequest('Invalid authentication'); }
            return dynamo_update(body, model, table);
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
            return dynamo_create(pd, table);
        case 'DELETE':
            if (!username) { return badRequest('Invalid authentication'); }

            let dd = model.verify(body);

            // display the type of the data
            console.log("Deleting item of type:", dd.constructor.name);

            return dynamo_delete(dd, table);
        default:
            throw new Error('Invalid operation');
    }
}

export async function get_sub_items(worldId, collectionName) {
    // Get all sub items of a collection
    let r = await dynamo_get(new Collection(collectionName, collectionName, worldId), dataTable, false);
    let thisCollection = JSON.parse(r.body);
    if (!thisCollection || !thisCollection['entries'] && !thisCollection['collections']) {
        console.error("Collection not found or empty:", collectionName);
        return {};
    }
    let res = {};
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

export async function get_style(parentId, worldId) {
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
    crud,
    dynamo_get,
    dynamo_list,
    dynamo_create,
    dynamo_update,
    dynamo_delete,
    dynamo_user_create,
    dynamo_get_map,
    dynamo_find_collection
};