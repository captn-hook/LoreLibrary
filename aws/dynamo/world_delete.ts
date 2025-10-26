export { delete_world }

import {
    GetCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import type { TransactWriteItem } from "@aws-sdk/client-dynamodb";

import { dataTable, ddbDocClient, make_collection, make_entry, userTable } from "./dynamo.ts"
import { User, World } from "../classes.ts";
import { delete_collection } from "./collection_delete.ts"
import { delete_entry } from "./entry_delete.ts";

async function delete_world(world: World, final = true, updateUser = true): Promise<TransactWriteItem[] | { statusCode: number; body: string }> {
    let transactionItems: TransactWriteItem[] = [];

    for (const collectionName of world['collections'] || []) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: world.name + "#COLLECTION",
                SK: collectionName
            }
        };
        const collectionData = await ddbDocClient.send(new GetCommand(params));
        if (!collectionData.Item) {
            console.error("Collection not found:", collectionName);
            continue; // Skip if collection not found
        }
        const col = make_collection(collectionData.Item);
        if (!col) {
            console.error("Invalid collection data:", collectionData.Item);
            continue; // Skip if invalid collection data
        }
        const collectionTsx = await delete_collection(col, false, false);
        if (Array.isArray(collectionTsx)) {
            transactionItems = transactionItems.concat(collectionTsx); // Fix concat issue
        } else {
            console.error("Error deleting collection:", collectionTsx);
        }
    }

    for (const entryName of world['entries'] || []) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: world.name + "#ENTRY",
                SK: entryName
            }
        };
        const entryData = await ddbDocClient.send(new GetCommand(params));
        if (!entryData.Item) {
            console.error("Entry not found:", entryName);
            continue; // Skip if entry not found
        }
        const entry = make_entry(entryData.Item);
        if (!entry) {
            console.error("Invalid entry data:", entryData.Item);
            continue; // Skip if invalid entry data
        }
        const entryTsx = await delete_entry(entry, false, false);
        if (Array.isArray(entryTsx)) {
            transactionItems = transactionItems.concat(entryTsx); // Fix concat issue
        } else {
            console.error("Delete entry returned promise:", entryTsx);
        }
    }

    transactionItems.push({
        Delete: {
            TableName: dataTable,
            Key: {
                PK: { S: world.pk() },
                SK: { S: world.sk() }
            }
        }
    });

    console.log("Deleting world:", world.name, "with ownerId:", world.parentId);
    if (updateUser) {
        if (!world.parentId) {
            throw new Error("World does not have a parentId");
        }
        const usero = new User(world.parentId);

        const params = {
            TableName: userTable,
            Key: {
                PK: usero.pk(),
                SK: usero.sk()
            }
        };
        const userData = await ddbDocClient.send(new GetCommand(params));
        if (!userData.Item) {
            throw new Error("User not found");
        }
        const user = userData.Item;
        if (user.worlds) {
            user.worlds = user.worlds.filter((w: string) => w !== world.name);
        }
        // turn the item into a dynamo item
        const u = {
            PK: user.PK,
            SK: user.SK,
            worlds: user.worlds || [],
            content: user.content || [],
        };
        transactionItems.push({
            Put: {
                TableName: userTable,
                Item: u
            }
        });
    }

    if (final) {
        try {
            console.log("Executing transaction with items:", transactionItems);
            for (const item of transactionItems) {
                console.log("Transaction item:", item);
            }
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "World deleted successfully" })
            };
        } catch (err) {
            console.error("Error deleting world:", err);
            throw new Error("Error deleting world");
        }
    } else {
        return transactionItems;
    }
}