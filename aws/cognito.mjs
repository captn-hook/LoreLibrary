import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { badRequest } from "./utilities.mjs";
import { dynamo_user_create } from "./dynamo.mjs";
import { SignUp, Token, User } from "./classes.mjs";

const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const userTable = process.env.USER_TABLE;

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

async function create_user(data) { // unstructired data
    try {
        data = new SignUp(data.username, data.email, data.password);
        // Create the user in Cognito
        const signUpCommand = new SignUpCommand({
            ClientId: clientId,
            Password: data.password,
            UserPoolId: userPoolId,
            Username: data.name,
            UserAttributes: [
                {
                    Name: "email",
                    Value: data.email,
                }
            ],
        });
        
        const signUpResponse = await cognitoClient.send(signUpCommand);

        if (!signUpResponse.UserSub) {
            throw new Error("Failed to create user in Cognito: " + signUpResponse);
        }
        try {
            await dynamo_user_create(data.name); // Create the user in DynamoDB
        } catch (err) {
            console.error("Error creating user in DynamoDB:", err);
            throw new Error("Failed to create user in DynamoDB: " + err.message);
        }
        // Return a success token
        console.log("Logging in user with Cognito:", data);
        return await login_user(data);
    } catch (err) {
        console.error("Error creating user:", err);

        // Handle specific Cognito errors
        if (err.name === "UsernameExistsException") {
            throw new Error("User already exists");
        } else if (err.name === "InvalidPasswordException") {
            throw new Error("Invalid password");
        } else if (err.name === "InvalidParameterException") {
            throw new Error("Invalid parameters");
        }

        throw new Error("Error creating user: " + err.message); // Fix this later
    }
}

async function login_user(data) {
    try {
        if (!data.username || !data.password) {
            console.error("Invalid login data:", data);
            return badRequest("Invalid username or password");
        }
        // Authenticate the user with Cognito
        const params = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: clientId,
            AuthParameters: {
                USERNAME: data.username,
                PASSWORD: data.password,
            },
        };

        const command = new InitiateAuthCommand(params);
        const response = await cognitoClient.send(command);

        // If authentication is successful, return the token
        const token = new Token(response.AuthenticationResult.IdToken, data.username);

        if (!token) {
            throw new Error("Failed to authenticate user: " + response);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(token),
        }
    } catch (err) {
        console.error("Error logging in user with Cognito:", err);

        // Handle specific Cognito errors
        if (err.name === "NotAuthorizedException") {
            return badRequest("Invalid username or password");
        } else if (err.name === "UserNotFoundException") {
            return badRequest("User not found");
        }

        throw new Error("Error logging in user: " + err.message); // Fix this later
    }
}

export { create_user, login_user };