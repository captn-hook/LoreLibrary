export { delete_user }

import {
    GetCommand,
    TransactWriteCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, dynamo_to_item, delete_world } from "./dynamo.mjs"

async function delete_user(user) {
    let transactionItems = [];

    for (const worldName of user.worlds) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: 'WORLD#',
                SK: worldName
            }
        };
        const worldData = await ddbDocClient.send(new GetCommand(params));
        if (!worldData.Item) {
            console.error("World not found:", worldName);
            continue; // Skip if world not found
        }
        const w = dynamo_to_item(worldData.Item, World);
        if (!w) {
            console.error("Invalid world data:", worldData.Item);
            continue; // Skip if invalid world data
        }
        const worldTsx = await delete_world(w, false, false);
        transactionItems = transactionItems.concat(worldTsx); // Fix concat issue
    }
    transactionItems.push({
        Delete: {
            TableName: userTable,
            Key: {
                PK: user.pk(),
                SK: user.sk()
            }
        }
    });

    try {
        const result = await ddbDocClient.send(new TransactWriteCommand({
            TransactItems: transactionItems
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User deleted successfully" })
        };
    } catch (err) {
        console.error("Error deleting user:", err);
        throw new Error("Error deleting user");
    }
}
