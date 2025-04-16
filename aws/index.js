const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_TABLE = 'lorelibrary-users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
exports.register = async (userId, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await dynamoDB.put({
        TableName: USERS_TABLE,
        Item: { PK: `USER#${userId}`, SK: `USER#${userId}`, userId, password: hashedPassword }
    }).promise();

    return { message: 'User registered successfully!' };
};

// Authenticate a user
exports.login = async (userId, password) => {
    const result = await dynamoDB.get({
        TableName: USERS_TABLE,
        Key: { PK: `USER#${userId}`, SK: `USER#${userId}` }
    }).promise();

    if (!result.Item) {
        throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, result.Item.password);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    return { token };
};

// Create a new world
exports.createWorld = async (worldId, userId) => {
    await dynamoDB.put({
        TableName: USERS_TABLE,
        Item: {
            PK: `USER#${userId}`,
            SK: `WORLD#${worldId}`,
            worldId,
            userId,
            createdAt: new Date().toISOString()
        }
    }).promise();

    return { message: 'World created successfully!' };
};

// Create a new collection within a world
exports.createCollection = async (worldId, collectionId, userId) => {
    await dynamoDB.put({
        TableName: USERS_TABLE,
        Item: {
            PK: `USER#${userId}#WORLD#${worldId}`,
            SK: `COLLECTION#${collectionId}`,
            collectionId,
            worldId,
            userId,
            createdAt: new Date().toISOString()
        }
    }).promise();

    return { message: 'Collection created successfully!' };
};

// Add an entry to a collection
exports.addEntry = async (worldId, collectionId, entryId, userId, content) => {
    await dynamoDB.put({
        TableName: USERS_TABLE,
        Item: {
            PK: `USER#${userId}#WORLD#${worldId}`,
            SK: `COLLECTION#${collectionId}#ENTRY#${entryId}`,
            collectionId,
            entryId,
            worldId,
            userId,
            content,
            createdAt: new Date().toISOString()
        }
    }).promise();

    return { message: 'Entry added successfully!' };
};

// Get all worlds for a user
exports.getWorlds = async (userId) => {
    const result = await dynamoDB.query({
        TableName: USERS_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'WORLD#'
        }
    }).promise();

    return result.Items;
};

// Get all collections in a world
exports.getCollections = async (worldId, userId) => {
    const result = await dynamoDB.query({
        TableName: USERS_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}#WORLD#${worldId}`,
            ':sk': 'COLLECTION#'
        }
    }).promise();

    return result.Items;
};

// Get all entries in a collection
exports.getEntries = async (worldId, collectionId, userId) => {
    const result = await dynamoDB.query({
        TableName: USERS_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}#WORLD#${worldId}`,
            ':sk': `COLLECTION#${collectionId}#ENTRY#`
        }
    }).promise();

    return result.Items;
};

// Upload a resource to a world
exports.uploadResource = async (worldId, userId, resourceId, fileContent, fileType) => {
    // Generate a unique S3 key for the resource
    const s3Key = `resources/${userId}/${worldId}/${resourceId}`;

    // Upload the resource to S3
    await s3.putObject({
        Bucket: process.env.S3_BUCKET_NAME, // Ensure this environment variable is set
        Key: s3Key,
        Body: fileContent,
        ContentType: fileType
    }).promise();

    // Store metadata in DynamoDB
    await dynamoDB.put({
        TableName: USERS_TABLE,
        Item: {
            PK: `USER#${userId}#WORLD#${worldId}`,
            SK: `RESOURCE#${resourceId}`,
            resourceId,
            worldId,
            userId,
            s3Key,
            fileType,
            uploadedAt: new Date().toISOString()
        }
    }).promise();

    return {
        message: 'Resource uploaded successfully!',
        resource: {
            resourceId,
            s3Key,
            fileType,
            uploadedAt: new Date().toISOString()
        }
    };
};