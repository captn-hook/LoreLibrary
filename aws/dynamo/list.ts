
export { dynamo_list }

import {
    QueryCommand,
    QueryCommandOutput
} from "@aws-sdk/lib-dynamodb";

import { dataTable, userTable, ddbDocClient, make } from "./dynamo.ts"
import { User, Model } from "../classes.ts";

async function dynamo_list(model: Model, sk = '') {

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
        let data: QueryCommandOutput = await ddbDocClient.send(new QueryCommand(params));
        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify([])
            };
        }
        // Convert each item in the list using dynamo_to_item
        const items = data.Items.map(item => make(item, model));
        let ret = items;

        return {
            statusCode: 200,
            body: JSON.stringify(ret)
        }
    } catch (err) {
        console.error("Error listing items:", err);
        throw new Error("Error listing items");
    }
}