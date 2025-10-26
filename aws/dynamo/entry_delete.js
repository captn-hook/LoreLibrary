
export { delete_entry }

import {
    GetCommand,
    TransactWriteCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, dynamo_to_item } from "./dynamo.mjs"
import { World, Collection } from "../classes.mjs";

async function delete_entry(entry, final = true, updateParent = true) {
    console.log("Deleting entry: ", entry);
    console.log("Deleting entry:", entry.pk(), entry.sk());
    if (final) {
        let transactionItems = [];
        if (updateParent) {
            let parent;
            try {
                try {
                    const col = new Collection(entry.parentId, null, entry.worldId);
                    console.log("Deleting entry from collection:", col.pk(), col.sk());
                    const params = {
                        TableName: dataTable,
                        Key: {
                            PK: col.pk(),
                            SK: col.sk()
                        }
                    };
                    let parentData = await ddbDocClient.send(new GetCommand(params));
                    if (!parentData.Item) {
                        console.error("Parent collection not found:", col);
                        throw new Error("Parent collection not found");
                    }   
                    parent = dynamo_to_item(parentData.Item, Collection);
                    if (!parent) {
                        console.error("Invalid parent collection data:", parentData.Item);
                        throw new Error("Invalid parent collection data");
                    }
                } catch (err) {
                    console.error("Error getting parent collection:", err);
                    console.log("Trying to get parent world instead...: ", entry.parentId);
                    const params = {
                        TableName: dataTable,
                        Key: {
                            PK: entry.parentId + '#',
                            SK: entry.worldId
                        }
                    };
                    let parentData = await ddbDocClient.send(new GetCommand(params));
                    if (!parentData.Item) {
                        console.error("Parent world not found:", entry.parentId);
                        throw new Error("Parent world not found");
                    }
                    parent = dynamo_to_item(parentData.Item, World);
                    
                    if (!parent) {
                        throw new Error("Parent world not found");
                    }
                }
            } catch (err) {
                console.error("Error getting parent collection or world:", err);
                throw new Error("Error getting parent collection or world");
            }

            if (!parent) {
                console.error("Parent collection or world not found for entry:", entry);
                throw new Error("Parent collection or world not found");
            }   

            if (parent['entries']) {
                parent['entries'] = parent['entries'].filter(e => e !== entry.name);
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
        }
        transactionItems.push({
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: entry.pk(),
                    SK: entry.sk()
                }
            }
        });
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
                body: JSON.stringify({ message: "Entry deleted successfully" })
            };
        } catch (err) {
            console.error("Error deleting entry:", err);
            throw new Error("Error deleting entry");
        }
    } else {
        return [{
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: entry.pk(),
                    SK: entry.sk()
                }
            }
        }];
    }
}