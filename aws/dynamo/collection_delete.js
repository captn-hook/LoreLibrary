
export { delete_collection }

import {
    GetCommand,
    TransactWriteCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, dynamo_to_item } from "./dynamo.mjs"
import { World, Collection, Entry } from "../classes.mjs";

import { delete_entry } from "./entry_delete"

async function delete_collection(collection, final = true, updateParent = true) {
    console.log("Deleting collection:", collection.pk(), collection.sk());
    let transactionItems = [];

    console.log("Collection entries:", collection['entries']);
    for (const entryName of collection['entries']) {
        console.log("Deleting entry:", entryName, "from collection:", collection.name);
        const params = {
            TableName: dataTable,
            Key: {
                PK: collection.worldId + "#ENTRY",
                SK: entryName
            }
        };
        const entryData = await ddbDocClient.send(new GetCommand(params));
        if (!entryData.Item) {
            console.error("Entry not found:", entryName);
            continue; // Skip if entry not found
        }
        const ent = dynamo_to_item(entryData.Item, Entry);
        if (!ent) {
            console.error("Invalid entry data:", entryData.Item);
            continue; // Skip if invalid entry data
        }
        const entryTsx = await delete_entry(ent, false, false);
        transactionItems = transactionItems.concat(entryTsx); // Fix concat issue
    }

    for (const collectionName of collection['collections']) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: collection.worldId + "#COLLECTION",
                SK: collectionName
            }
        };
        const collectionData = await ddbDocClient.send(new GetCommand(params));
        if (!collectionData.Item) {
            console.error("Sub-collection not found:", collectionName);
            continue; // Skip if sub-collection not found
        }
        const col = dynamo_to_item(collectionData.Item, Collection);
        if (!col) {
            console.error("Invalid sub-collection data:", collectionData.Item);
            continue; // Skip if invalid sub-collection data
        }
        const collectionTsx = await delete_collection(col, false, false);
        transactionItems = transactionItems.concat(collectionTsx); // Fix concat issue
    }

    transactionItems.push({
        Delete: {
            TableName: dataTable,
            Key: {
                PK: collection.pk(),
                SK: collection.sk()
            }
        }
    });

    if (updateParent) {
        try {
            const params = {
                TableName: dataTable,
                Key: {
                    PK: 'WORLD#',
                    SK: collection.worldId
                }
            };
            let parentData = await ddbDocClient.send(new GetCommand(params));
            if (!parentData.Item) {
                console.log("Parent world not found, trying to get parent collection instead...");
                throw new Error("Parent world not found");
            }
            let parent = dynamo_to_item(parentData.Item, World);
            if (!parent) {
                console.error("Invalid parent world data:", parentData.Item);
                throw new Error("Invalid parent world data");
            }
            if (parent['collections']) {
                parent['collections'] = parent['collections'].filter(c => c !== collection.name);
            }
            // turn the item into a dynamo item
            const p = {
                PK: parent.pk(),
                SK: parent.sk(),
                ...parent.getBody(),
            };
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: p
                }
            });
        } catch (err) {
            console.log("Error getting parent world:", err);
            console.log("Trying to get parent collection instead...: ", collection.parentId);
            const params = {
                TableName: dataTable,
                Key: {
                    PK: collection.parentId + '#COLLECTION',
                    SK: collection.worldId
                }
            };
            let parentData = await ddbDocClient.send(new GetCommand(params));
            if (!parentData.Item) {
                console.error("Parent collection not found:", collection.parentId);
                throw new Error("Parent collection not found");
            }
            let parent = dynamo_to_item(parentData.Item, Collection);
            if (!parent) {
                console.error("Invalid parent collection data:", parentData.Item);
                throw new Error("Invalid parent collection data");
            }
            if (parent['collections']) {
                parent['collections'] = parent['collections'].filter(c => c !== collection.name);
            }

            const p = {
                PK: parent.pk(),
                SK: parent.sk(),
                ...parent.getBody(),
            };

            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: p
                }
            });
        }
    }

    if (final) {
        try {
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Collection deleted successfully" })
            };
        } catch (err) {
            console.error("Error deleting collection:", err);
            throw new Error("Error deleting collection");
        }
    } else {
        return transactionItems;
    }
}