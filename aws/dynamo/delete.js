export { dynamo_delete }

import {
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, dynamo_to_item } from "./dynamo.mjs"
import { World, Collection, Entry, User } from "../classes.mjs";

import { delete_entry } from "./entry_delete.js";
import { delete_collection } from "./collection_delete.js"
import { delete_world } from "./world_delete.js"

async function dynamo_delete(data) {
    // Delete an item from the database and update associated items
    console.log("Deleting item of type:", data.constructor.name);

    console.log("Deleting item:", data.pk(), data.sk());
    // get the item to delete
    const params = {
        TableName: dataTable,
        Key: {
            PK: data.pk(),
            SK: data.sk()
        }
    };

    let item;
    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            console.error("Item not found:", data);
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Item not found" })
            };
        }
        item = dynamo_to_item(res.Item, data.constructor);
    } catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
    if (!item) {
        console.error("Item not found:", data);
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Item not found" })
        };
    }

    // if the item is a user, get all the worlds with their id
    if (item instanceof User) {
        console.log("Deleting user:", item.username);
        return delete_user(item);
    }
    else if (item instanceof World) {
        console.log("Deleting world:", item.name);
        return delete_world(item);
    }
    else if (item instanceof Collection) {
        console.log("Deleting collection:", item.name);
        return delete_collection(item);
    }
    else if (item instanceof Entry) {
        console.log("Deleting entry:", item.name);
        return delete_entry(item);
    } else {
        throw new Error("Invalid item type for deletion");
    }
}