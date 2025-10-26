export { dynamo_create }

import {
    GetCommand,
    TransactWriteCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, userTable, ddbDocClient, dynamo_get } from "./dynamo.js"
import { World, Collection, Entry, DModel } from "../classes.js";

async function dynamo_create(data: InstanceType<DModel>, table = dataTable) {

    console.log("Creating item of type:", data.constructor.name);
    console.log("Creating item:", data.pk(), data.sk());

    const params = {
        TableName: table,
        Key: {
            PK: data.pk(),
            SK: data.sk()
        }
    };

    let existingItem: any;
    try {
        existingItem = await ddbDocClient.send(new GetCommand(params));
        console.log("Existing item:", existingItem);
    } catch (err) {
        console.error('Item not found, creating new item');
    }

    if (existingItem.Item) {
        console.error("Item already exists:", existingItem.Item);
        // return error code 409
        return {
            statusCode: 409,
            body: JSON.stringify({ message: "Item already exists" })
        }
    }

    const newItem = {
        PK: data.pk(),
        SK: data.sk(),
        ...data.getBody(),
    };

    let transactionItems = [];

    // add the new item to the transaction items
    transactionItems.push({
        Put: {
            TableName: dataTable,
            Item: newItem
        }
    });

    if (data instanceof World) {
        // if world, add it to the user
        const userPrefix = 'USER#';
        const userParams = {
            TableName: userTable,
            Key: {
                PK: userPrefix,
                SK: data.parentId
            }
        };
        const userData = await ddbDocClient.send(new GetCommand(userParams));
        if (!userData.Item) {
            throw new Error("User not found");
        }
        const user = userData.Item;
        if (!user.worlds) {
            user.worlds = [];
        }
        user.worlds.push(data.name);
        transactionItems.push({
            Put: {
                TableName: userTable,
                Item: user
            }
        });
    } else if (data instanceof Collection) {
        // if collection, add it to its parent
        try {
            const collectionParams = {
                TableName: dataTable,
                Key: {
                    PK: data.worldId + '#COLLECTION',
                    SK: data.parentId
                }
            };
            const collectionData = await ddbDocClient.send(new GetCommand(collectionParams));
            if (!collectionData.Item) {
                throw new Error("Collection not found");
            }
            const collection = collectionData.Item;
            if (!collection['collections']) {
                collection['collections'] = [];
            }
            collection['collections'].push(data.name);
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: collection
                }
            });
        } catch (err) {
            // Failed to get the parent collection, try to get the parent world instead
            console.error("Error getting parent collection:", err); 
            const worldPrefix = 'WORLD#';
            const worldParams = {
                TableName: dataTable,
                Key: {
                    PK: worldPrefix,
                    SK: data.worldId
                }
            };
            const worldData = await ddbDocClient.send(new GetCommand(worldParams));
            if (!worldData.Item) {
                throw new Error("World not found");
            }
            const world = worldData.Item;
            if (!world['collections']) {
                world['collections'] = [];
            }
            world['collections'].push(data.name);
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: world
                }
            });
        }
    } else if (data instanceof Entry) {
        try {
            // if entry, add it to the collection
            const collectionParams = {
                TableName: dataTable,
                Key: {
                    PK: data.worldId + '#COLLECTION',
                    SK: data.parentId
                }
            };
            const collectionData = await ddbDocClient.send(new GetCommand(collectionParams));
            if (!collectionData.Item) {
                throw new Error("Collection not found");
            }
            const collection = collectionData.Item;
            if (!collection['entries']) {
                collection['entries'] = [];
            }
            collection['entries'].push(data.name);
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: collection
                }
            });
        } catch (err) {
            // try to get the parent world instead
            console.error("Error getting parent collection:", err);
            console.log("Trying to get parent world instead...: ", data.parentId);
            const worldParams = {
                TableName: dataTable,
                Key: {
                    PK: 'WORLD#',
                    SK: data.worldId
                }
            };
            const worldData = await ddbDocClient.send(new GetCommand(worldParams));
            if (!worldData.Item) {
                throw new Error("World not found");
            }
            const world = worldData.Item;
            if (!world['entries']) {
                world['entries'] = [];
            }
            world['entries'].push(data.name);
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: world
                }
            });
        }
    }

    try {
        const result = await ddbDocClient.send(new TransactWriteCommand({
            TransactItems: transactionItems
        }));
        // for (const key in data) {
        //     if (result.Attributes && result.Attributes.hasOwnProperty(key) && data[key] !== undefined) {
        //         data[key] = result.Attributes[key];
        //     }
        // }
        console.log("Item created successfully:", data, result);
        return dynamo_get(data, table);
    } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
    }
}
