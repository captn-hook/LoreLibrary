export { dynamo_find_collection }

import {
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient } from "./dynamo.mjs"
import { Collection } from "../classes.mjs";

async function dynamo_find_collection(worldId, collectionName) {
    // Find a top level collection in a world, return true or false
    try {
        const collection = new Collection(collectionName, worldId, worldId);
        const params = {
            TableName: dataTable,
            Key: {
                PK: collection.pk(),
                SK: collection.sk()
            }
        };
        const res = await ddbDocClient.send(new GetCommand(params));
        console.log("Find collection response:", res);
        if (res.Item) {
            return true; // Collection exists
        } else {
            return false; // Collection does not exist
        }
    } catch (err) {
        console.error("Error finding collection:", err);
        throw new Error("Error finding collection");
    }
}
