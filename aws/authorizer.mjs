import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';


const issuer = process.env.COGNITO_ISSUER;
const audience = process.env.COGNITO_AUDIENCE;

const jwtclient = jwksClient({
    jwksUri: `${issuer}/.well-known/jwks.json`,
});

const dataTable = process.env.DATA_TABLE;
const userTable = process.env.USER_TABLE;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Function to get the signing key
function getSigningKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
}

// Function to verify the token
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getSigningKey,
            {
                audience: audience,
                issuer: issuer,
                algorithms: ['RS256'],
            },
            (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            }
        );
    });
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