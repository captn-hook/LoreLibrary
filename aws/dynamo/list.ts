
export { dynamo_list }

import {
    QueryCommand,
    QueryCommandOutput
} from "@aws-sdk/lib-dynamodb";

import { dataTable, userTable, ddbDocClient, make } from "./dynamo.ts"
import { User, Model } from "../classes.ts";

async function dynamo_list(model: Model, sk = '', limit?: number, cursor?: string) {

    let params: any;
    if (model === User) {
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

    if (limit) {
        params.Limit = limit;
    }

    if (cursor) {
        try {
            params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
        } catch (err) {
            console.error("Invalid cursor:", err);
        }
    }

    try {
        let data: QueryCommandOutput = await ddbDocClient.send(new QueryCommand(params));
        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ items: [], nextToken: null })
            };
        }
        const items = data.Items.map(item => make(item, model));

        const nextToken = data.LastEvaluatedKey
            ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64')
            : null;

        return {
            statusCode: 200,
            body: JSON.stringify({ items, nextToken })
        }
    } catch (err) {
        console.error("Error listing items:", err);
        throw new Error("Error listing items");
    }
}
