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
    let token;

    try {
        token = e.headers.Authorization
        console.log('tokene', token);
    } catch (err) {
        console.log('Error getting token', err);
        return {
            'isAuthorized': false
        }
    }

    if (!token) {
        console.log('No token found');
        return {
            'isAuthorized': false
        }
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        console.log('Invalid token');
        return {
            'isAuthorized': false,
            'context': {
                'username': decoded.username,
            }
        }
    }

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            PK: 'USER#',
            SK: decoded.username
        },
    }

    console.log('params', params);

    const user = await docClient.send(new GetCommand(params));

    console.log('user', user);

    if (!user.Item) {
        console.log('User not found');
        return {
            'isAuthorized': false
        }
    }

    // Ensure the user is making the request
    if (JSON.parse(e.body).username !== decoded.username) {
        return {
            'isAuthorized': false
        }
    }

    return {
        'isAuthorized': true,
        'context': {
            'username': decoded.username,
        }
    };
}