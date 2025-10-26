export { dynamo_get }

import {
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, make, get_style } from "./dynamo.ts"
import { World, User, Entry, Collection } from "../classes.ts";

async function dynamo_get<M extends typeof User | typeof World | typeof Entry | typeof Collection>(
    data: InstanceType<M>,
    table = dataTable,
    getStyle = true
) {

    console.log("Getting item of type:", data.constructor.name);
    console.log("Getting item:", data.pk(), data.sk());

    const params = {
        TableName: table,
        Key: {
            PK: { S: data.pk() },
            SK: { S: data.sk() }
        }
    };
    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            console.error("Item not found:", data);
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Item not found" })
            }
        }
        // update the item with the new data
        for (const key in data) {
            if (res.Item.hasOwnProperty(key) && data[key] !== undefined) {
                data[key] = res.Item[key];
            }
        }
        // if the style data is undefined, get its parent to fill it in
        if (getStyle && !(data instanceof World) && !(data instanceof User) && data.style === '' && data.parentId && data.worldId) {
            data.style = await get_style(data.parentId, data.worldId);
        }
        // convert the item to the correct model
        const ctor = data.constructor as M;
        let d = make(res.Item, ctor);
        if (!d) {
            console.error("Error converting item to model:", res.Item);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error converting item to model" })
            };
        }
        data = d;
        console.log("Item retrieved successfully:", data);
        return {
            statusCode: 200,
            body: JSON.stringify(data.getBody())
        };
    }
    catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
}

