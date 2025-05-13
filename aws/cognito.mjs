import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const userTable = process.env.USER_TABLE;

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

async function create_user(data, username) {
    try {
        // Create the user in Cognito
        const signUpCommand = new SignUpCommand({
            ClientId: clientId,
            Password: data.password,
            UserPoolId: userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "email",
                    Value: data.email,
                }
            ],
        });
        
        const signUpResponse = await cognitoClient.send(signUpCommand);

        console.log("User created in Cognito:", signUpResponse);

        await dynamo_user_create(data, username, userTable);
        
        // Return a success response
        return { message: "User created successfully", username };
    } catch (err) {
        console.error("Error creating user in Cognito:", err);

        // Handle specific Cognito errors
        if (err.name === "UsernameExistsException") {
            throw new Error("User already exists");
        } else if (err.name === "InvalidPasswordException") {
            throw new Error("Invalid password");
        } else if (err.name === "InvalidParameterException") {
            throw new Error("Invalid parameters");
        }

        throw new Error("Error creating user");
    }
}

async function login_user(data, username) {

    try {
        // Authenticate the user with Cognito
        const params = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: clientId,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: data.password,
            },
        };

        const command = new InitiateAuthCommand(params);
        const response = await cognitoClient.send(command);

        // If authentication is successful, return the token
        const token = response.AuthenticationResult.IdToken;
        return new Token(token, username);
    } catch (err) {
        console.error("Error logging in user with Cognito:", err);

        // Handle specific Cognito errors
        if (err.name === "NotAuthorizedException") {
            return badRequest("Invalid username or password");
        } else if (err.name === "UserNotFoundException") {
            return badRequest("User not found");
        }

        throw new Error("Error logging in user");
    }
}

export { create_user, login_user };