import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Function to verify the token
async function verifyToken(token) {
    console.log('Verifying token: ', token);
    try {
        const verifier = CognitoJwtVerifier.create({
            userPoolId,
            tokenUse: "id",
            clientId: clientId,
        });

        const payload = await verifier.verify(token);
        console.log('Decoded JWT:', payload);
        return payload['cognito:username'];
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
        console.log('Decoded token: ', decoded);
        return {
            'isAuthorized': true,
            'context': {
                'username': decoded,
            }
        };
    } catch (err) {
        console.log('Error in authorizer: ', e, ' got error: ', err);
        return {
            'isAuthorized': false
        }
    }
}