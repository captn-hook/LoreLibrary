export { delete_user }

import {
    GetCommand,
    TransactWriteCommand
} from "@aws-sdk/lib-dynamodb";

import type { TransactWriteItem } from "@aws-sdk/client-dynamodb";

import { userTable, dataTable, ddbDocClient, make_world } from "./dynamo.ts"
import { delete_world } from "./world_delete.ts";

import { User, World } from "../classes";

async function delete_user(user: User) {
    let transactionItems: TransactWriteItem[] = [];

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
        const w = make_world(worldData.Item);
        if (!w) {
            console.error("Invalid world data:", worldData.Item);
            continue; // Skip if invalid world data
        }
        const worldTsx = await delete_world(w, false, false);
        if (Array.isArray(worldTsx)) {
            transactionItems = transactionItems.concat(worldTsx);
        } else {
            console.error("Error deleting world:", worldTsx);
        }
    }
    transactionItems.push({
        Delete: {
            TableName: userTable,
            Key: {
                PK: { S: user.pk() },
                SK: { S: user.sk() }
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
