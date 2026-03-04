export { dynamo_get_mapping }

import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dataTable, ddbDocClient, make_collection, make_entry, make_world } from "./dynamo.ts";
import { World, Collection } from "../classes.ts";

async function fetch_children(worldId: string, item: World | Collection): Promise<any> {
    const body: any = item.getBody();
    const entries: string[] = item.entries || [];
    const collections: string[] = item.collections || [];

    const [fetchedEntries, fetchedCollections] = await Promise.all([
        Promise.all(entries.map(entryName =>
            ddbDocClient.send(new GetCommand({
                TableName: dataTable,
                Key: { PK: worldId + "#ENTRY", SK: entryName }
            })).then(res => {
                if (!res.Item) return null;
                const entry = make_entry(res.Item);
                return entry ? entry.getBody() : null;
            }).catch(err => {
                console.error("Error fetching entry in mapping:", entryName, err);
                return null;
            })
        )),
        Promise.all(collections.map(colName =>
            ddbDocClient.send(new GetCommand({
                TableName: dataTable,
                Key: { PK: worldId + "#COLLECTION", SK: colName }
            })).then(async res => {
                if (!res.Item) return null;
                const col = make_collection(res.Item);
                if (!col) return null;
                return await fetch_children(worldId, col);
            }).catch(err => {
                console.error("Error fetching collection in mapping:", colName, err);
                return null;
            })
        ))
    ]);

    body.entries = fetchedEntries.filter(Boolean);
    body.collections = fetchedCollections.filter(Boolean);
    return body;
}

async function dynamo_get_mapping(worldId: string, collectionName?: string) {
    if (collectionName) {
        const res = await ddbDocClient.send(new GetCommand({
            TableName: dataTable,
            Key: { PK: worldId + "#COLLECTION", SK: collectionName }
        }));
        if (!res.Item) {
            return { statusCode: 404, body: JSON.stringify({ message: "Item not found" }) };
        }
        const col = make_collection(res.Item);
        if (!col) {
            return { statusCode: 500, body: JSON.stringify({ message: "Error reading item" }) };
        }
        return { statusCode: 200, body: JSON.stringify(await fetch_children(worldId, col)) };
    } else {
        const res = await ddbDocClient.send(new GetCommand({
            TableName: dataTable,
            Key: { PK: "WORLD#", SK: worldId }
        }));
        if (!res.Item) {
            return { statusCode: 404, body: JSON.stringify({ message: "World not found" }) };
        }
        const world = make_world(res.Item);
        if (!world) {
            return { statusCode: 500, body: JSON.stringify({ message: "Error reading world" }) };
        }
        return { statusCode: 200, body: JSON.stringify(await fetch_children(worldId, world)) };
    }
}
