export { dynamo_get_map }

import {
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, get_sub_items, dynamo_to_item } from "./dynamo.mjs"
import { World } from "../classes.mjs";

async function dynamo_get_map(worldId) {
    // Returns the full structure of documents in a world
    let g = new World(worldId);
    const params = {
        TableName: dataTable,
        Key: {
            PK: g.pk(),
            SK: g.sk()
        }
    };

    let world;
    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            throw new Error("World not found");
        }
        world = dynamo_to_item(res.Item, World);
    } catch (err) {
        console.error("Error getting world:", err);
        throw new Error("Error getting world");
    }

    if (!world) {
        throw new Error("World not found");
    }

    let map = {};
    map['entries'] = world['entries'] || [];
    for (const collectionName of world['collections'] || []) {
        map[collectionName] = await get_sub_items(worldId, collectionName);
    }
    return map;
}