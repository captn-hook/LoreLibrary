import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";
    
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// async function generateToken(username) {
//     // Generate a token for the user
//     const token = await jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     return token;
// }

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

function getAuthorization(authorization) {
    if (!authorization) {
        return null;
    }
    const token = authorization.split(' ')[1];
    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

export const handler = async (e) => {
    console.log('event', e);

    const token = getAuthorization(e.headers.Authorization);

    if (!token) {
        return false
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return false
    }

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            PK: `USER#${decoded.username}`,
            SK: `USER#${decoded.username}`,
        },
    };
               
            
    console.log('params', params);

    const user = await docClient.send(new GetCommand(params));

    console.log('user', user);

    if (!user.Item) {
        return false
    }

    // Ensure the user is making the request
    if (JSON.parse(e.body).username !== decoded.username) {
        return false
    }

    return true;
}