import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import jwt from 'jsonwebtoken';

const issuer = process.env.COGNITO_ISSUER;
const audience = process.env.COGNITO_AUDIENCE;

const dataTable = process.env.DATA_TABLE;
const userTable = process.env.USER_TABLE;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Function to verify the token
async function verifyToken(token) {
    console.log('Verifying token: ', token);
    try {
        const verifier = CognitoJwtVerifier.create({
            userPoolId,
            tokenUse: "access",
            clientId: audience,
        });

        const payload = await verifier.verify(token);
        console.log('Decoded JWT:', payload);
    } catch (err) {
        console.error('Error verifying JWT:', err);
        throw err;
    }
}

export const handler = async (e) => {

    try {
        let token;

        try {
            token = e.identitySource[0]
        } catch (err) {
            console.log('Error getting token from request: ', e, ' got error: ', err);
            return {
                'isAuthorized': false
            }
        }

        if (!token) {
            console.log('No token found in request: ', e);
            return {
                'isAuthorized': false
            }
        }

        const decoded = await verifyToken(token).catch((err) => {
            console.log('Error verifying token for request: ', e, ' got error: ', err);
            return {
                'isAuthorized': false
            }
        });

        const params = {
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: 'USER#',
                SK: decoded.username
            },
        }

        const user = await docClient.send(new GetCommand(params));

        if (!user.Item) {
            console.log('User not found in database: ', e);
            return {
                'isAuthorized': false
            }
        }
        console.log('User found in database: ', e);
        return {
            'isAuthorized': true,
            'context': {
                'username': user.Item.SK
            }
        };
    } catch (err) {
        console.log('Error in authorizer: ', e, ' got error: ', err);
        return {
            'isAuthorized': false
        }
    }
}