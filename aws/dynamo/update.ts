export { dynamo_update }

import {
    UpdateCommand,
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, make } from "./dynamo.ts"
import { Model } from "../classes.ts"

async function dynamo_update(data: object, model: Model, table = dataTable) {

    const newItem = await update(data, model.verify(data), table);
    const params = {
        TableName: table,
        Key: {
            PK: { S: newItem.pk() },
            SK: { S: newItem.sk() }
        },
        UpdateExpression: "SET " + Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .map((key, index) => `#key${index} = :value${index}`)
            .join(", "),
        ExpressionAttributeNames: Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .reduce<Record<string, string>>((acc, key, index) => {
                acc[`#key${index}`] = key;
                return acc;
            }, {}),
        ExpressionAttributeValues: Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .reduce<Record<string, any>>((acc, key, index) => {
                acc[`:value${index}`] = (newItem as any)[key];
                return acc;
            }, {}),
        ReturnValues: "ALL_NEW" as const
    };

    try {
        const res = await ddbDocClient.send(new UpdateCommand(params));
        if (!res.Attributes) {
            throw new Error("Item not found");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(make(res.Attributes, model))
        };
    } catch (err) {
        console.error("Error updating item:", err);
        throw new Error("Error updating item");
    }
}

async function update<M extends Model>(
    data: object,
    instance: InstanceType<M>,
    table = dataTable
) {
    // get the item to update and replace any present keys
    const getParams = {
        TableName: table,
        Key: {
            PK: instance.pk(),
            SK: instance.sk()
        }
    };

    let item;
    try {
        const res = await ddbDocClient.send(new GetCommand(getParams));
        if (!res.Item) {
            throw new Error("Item not found");
        }

        const ctor = instance.constructor as M;
        item = make(res.Item, ctor);
        if (!item) {
            throw new Error("Error making item");
        }
        item = ctor.verify(item);

    } catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }

    if (!item) {
        throw new Error("Item not found");
    }

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(item, key) && (data as any)[key] !== undefined) {
            (item as any)[key] = (data as any)[key];
        }
    }

    try {
        const ctor = instance.constructor as M;
        item = ctor.verify(item);
        if (item === null) {
            throw new Error("Invalid item data");
        }
        return item;
    } catch (err) {
        console.error("Error verifying item:", err);
        throw new Error("Error verifying item");
    }
}