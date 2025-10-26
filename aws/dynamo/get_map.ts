export { dynamo_get_map }

import {
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, get_sub_items, make_world } from "./dynamo.ts"
import { World } from "../classes.ts";

async function dynamo_get_map(worldId: string) {
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
        world = make_world(res.Item);
    } catch (err) {
        console.error("Error getting world:", err);
        throw new Error("Error getting world");
    }

    if (!world) {
        throw new Error("World not found");
    }

    let map: any = {};
    map['entries'] = world['entries'] || [];
    for (const collectionName of world['collections'] || []) {
        map[collectionName] = await get_sub_items(worldId, collectionName);
    }
    return map;
}