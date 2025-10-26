export { dynamo_user_create }

import {
    PutCommand
} from "@aws-sdk/lib-dynamodb";

import { userTable, ddbDocClient } from "./dynamo.mjs"
import { User } from "../classes.mjs";

async function dynamo_user_create(username) {
    // Create a new user in the user table
    const user = new User(username);
    const params = {
        TableName: userTable,
        Item: {
            PK: user.pk(),
            SK: user.sk(),
            content: user.content,
            worlds: user.worlds
        }
    };
    try {
        const res = await ddbDocClient.send(new PutCommand(params));
        if (res.$metadata.httpStatusCode == '200') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "User created successfully" })
            };
        } else {
            throw new Error("Failed to create user");
        }
    } catch (err) {
        console.error("Error creating user:", err);
        throw new Error("Error creating user");
    }
}
