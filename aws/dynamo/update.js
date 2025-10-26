export { dynamo_update }

import {
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, dynamo_to_item } from "./dynamo.mjs"

async function dynamo_update(data, model, table = dataTable) {

    const newItem = await update(data, model.verify(data), table);
    const params = {
        TableName: table,
        Key: {
            PK: newItem.pk(),
            SK: newItem.sk()
        },
        UpdateExpression: "SET " + Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .map((key, index) => `#key${index} = :value${index}`)
            .join(", "),
        ExpressionAttributeNames: Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .reduce((acc, key, index) => {
                acc[`#key${index}`] = key;
                return acc;
            }, {}),
        ExpressionAttributeValues: Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .reduce((acc, key, index) => {
                acc[`:value${index}`] = newItem[key];
                return acc;
            }, {}),
        ReturnValues: "ALL_NEW"
    };

    try {
        const res = await ddbDocClient.send(new UpdateCommand(params));
        if (!res.Attributes) {
            throw new Error("Item not found");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(dynamo_to_item(res.Attributes, model))
        };
    } catch (err) {
        console.error("Error updating item:", err);
        throw new Error("Error updating item");
    }
}

async function update(data, instance, table = dataTable) {
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
        item = dynamo_to_item(res.Item, instance.constructor);
        item = instance.constructor.verify(item);
        
    } catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }

    if (!item) {
        throw new Error("Item not found");
    }

    for (const key in data) {
        if (item.hasOwnProperty(key) && data[key] !== undefined) {
            item[key] = data[key];
        }
    }
    

    try {
        item = instance.constructor.verify(item);
        if (item === null) {
            throw new Error("Invalid item data");
        }    
       return item;
    } catch (err) {
        console.error("Error verifying item:", err);
        throw new Error("Error verifying item");
    }
}