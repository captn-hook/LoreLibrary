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

async function delete_world(world: World, updateUser = true): Promise<{ statusCode: number; body: string }> {
    // Step 1 (atomic): delete the world record and remove it from the owner's worlds list.
    // This is the guaranteed part — once this succeeds the world is gone.
    let transactionItems: TransactWriteItem[] = [];

    transactionItems.push({
        Delete: {
            TableName: dataTable,
            Key: {
                PK: { S: world.pk() },
                SK: { S: world.sk() }
            }
        }
    });

    if (updateUser) {
        if (!world.parentId) {
            throw new Error("World does not have a parentId");
        }
        const usero = new User(world.parentId);
        const userData = await ddbDocClient.send(new GetCommand({
            TableName: userTable,
            Key: { PK: usero.pk(), SK: usero.sk() }
        }));
        if (!userData.Item) {
            throw new Error("User not found");
        }
        const user = userData.Item;
        const updatedWorlds = (user.worlds || []).filter((w: string) => w !== world.name);
        transactionItems.push({
            Put: {
                TableName: userTable,
                Item: {
                    PK: user.PK,
                    SK: user.SK,
                    worlds: updatedWorlds,
                    content: user.content || [],
                }
            }
        });
    }

    try {
        await ddbDocClient.send(new TransactWriteCommand({ TransactItems: transactionItems }));
    } catch (err) {
        console.error("Error deleting world record:", err);
        throw new Error("Error deleting world");
    }

    // Step 2 (best-effort): delete child collections and entries.
    // These are not atomic — failures leave orphaned items that can be cleaned up later
    // via cleanup_world_items() in dynamo.ts.
    const childDeletes: Promise<any>[] = [];

    for (const collectionName of world['collections'] || []) {
        childDeletes.push(
            ddbDocClient.send(new GetCommand({
                TableName: dataTable,
                Key: { PK: world.name + "#COLLECTION", SK: collectionName }
            })).then(res => {
                if (!res.Item) return;
                const col = make_collection(res.Item);
                if (col) return delete_collection(col, true, false);
            }).catch(err => console.error("Orphan collection after world delete:", collectionName, err))
        );
    }

    for (const entryName of world['entries'] || []) {
        childDeletes.push(
            ddbDocClient.send(new GetCommand({
                TableName: dataTable,
                Key: { PK: world.name + "#ENTRY", SK: entryName }
            })).then(res => {
                if (!res.Item) return;
                const entry = make_entry(res.Item);
                if (entry) return delete_entry(entry, true, false);
            }).catch(err => console.error("Orphan entry after world delete:", entryName, err))
        );
    }

    const results = await Promise.allSettled(childDeletes);
    const orphanCount = results.filter(r => r.status === 'rejected').length;
    if (orphanCount > 0) {
        console.error(`${orphanCount} child item(s) could not be deleted after world '${world.name}' was removed`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "World deleted successfully", orphans: orphanCount })
    };
}
