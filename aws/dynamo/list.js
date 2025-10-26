
export { dynamo_list }

import {
    QueryCommand
} from "@aws-sdk/lib-dynamodb";

import { dataTable, ddbDocClient, dynamo_to_item } from "./dynamo.mjs"
import { User } from "../classes.mjs";

async function dynamo_list(model, sk = '') {

    let params;
    if (model === User) {
        //list all users in the user table
        params = {
            TableName: userTable,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'USER#'
            }
        };
    } else {
        const prefix = model.name.toUpperCase() + '#' + sk;
        params = {
            TableName: dataTable,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': prefix
            }
        };
    }
    try {
        let data = await ddbDocClient.send(new QueryCommand(params));
        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify([])
            };
        }
        // Convert each item in the list using dynamo_to_item
        const items = data.Items.map(item => dynamo_to_item(item, model));
        data = items;

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }
    } catch (err) {
        console.error("Error listing items:", err);
        throw new Error("Error listing items");
    }
}