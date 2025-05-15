import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { badRequest } from "./utilities.mjs";
import { World, Collection, Entry, User, DataShort } from "./classes.mjs";


const ddbClient = new DynamoDBClient({ region: "us-west-2" });

const dataTable = process.env.DATA_TABLE;
const userTable = process.env.USER_TABLE;

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

function crud(operation, model, body, username) {
    var table;
    if (model == User) {
        table = userTable;
    } else {
        table = dataTable;
    }

    switch (operation) {
        case 'POST':
            if (!username) { return badRequest('Invalid authentication'); }

            var data = model.verify(body);
            if (data === null) {
                return badRequest('Invalid body');
            }
            return dynamo_create(data, table);

        case 'GET':
            if (model === User && !username) { return badRequest('Invalid authentication'); }

            var data = DataShort.verify(body);
            if (data === null) {
                return badRequest('Invalid body');
            }

            return dynamo_get(data, table);
        case 'PUT':
            if (!username) { return badRequest('Invalid authentication'); }

            return dynamo_update(data, table);
        case 'DELETE':
            if (!username) { return badRequest('Invalid authentication'); }

            var data = DataShort.verify(body);

            return dynamo_delete(data, table);
        default:
            throw new Error('Invalid operation');
    }
}

function update(data, table = dataTable) {
    // get the item to update and replace any present keys
    const instance = DataShort.verify(data);
    var item = dynamo_get(instance, table);
    if (!item) { throw new Error('Item not found'); }
    
    for (const key in data) {
        if (item.hasOwnProperty(key) && data[key] !== undefined) {
            item[key] = data[key];
        }
    }
    return item;
}

async function dynamo_get(data, table = dataTable) {

    const params = {
        TableName: table,
        Key: {
            PK: data.pk(),
            SK: data.name
        }
    };

    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            throw new Error("Item not found");
        }
        // create a new instance of the model with the data
        const item = data.verify(res.Item);
        if (!item) {
            throw new Error("Invalid item data");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(item)
        };
    }
    catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
}

async function dynamo_list(model, sk = '') {

    if (model === User) {
        //list all users in the user table
        const params = {
            TableName: userTable,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'USER#'
            }
        };
    } else {
        const prefix = model.name.toUpperCase() + '#' + sk;
        const params = {
            TableName: table,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': prefix
            }
        };
    }
    try {
        let data = await ddbDocClient.send(new QueryCommand(params));
        data = data.Items.map(item => new model(item));
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }
    } catch (err) {
        console.error("Error listing items:", err);
        throw new Error("Error listing items");
    }
}


async function dynamo_create(data, table = dataTable) {

    // Try to get the item in case it already exists
    const sh = DataShort.verify(data);
    if (!sh) { return badRequest('Invalid data'); }
    const params = {
        TableName: table,
        Key: {
            PK: data.pk(),
            SK: data.name
        }
    };

    const existingItem = await ddbDocClient.send(new GetCommand(params));
    if (existingItem.Item) {
        throw new Error("Item already exists");
    }

    const { name, ...rest } = data;
    const newItem = {
        PK: data.pk(),
        SK: name,
        ...rest
    };

    let transactionItems = [];

    // add the new item to the transaction items
    transactionItems.push({
        Put: {
            TableName: dataTable,
            Item: newItem
        }
    });

    if (model === World) {
        // if world, add it to the user
        const userPrefix = 'USER#';
        const userParams = {
            TableName: userTable,
            Key: {
                PK: userPrefix,
                SK: data.parentId
            }
        };
        const userData = await ddbDocClient.send(new GetCommand(userParams));
        if (!userData.Item) {
            throw new Error("User not found");
        }
        const user = userData.Item;
        if (!user.worlds) {
            user.worlds = [];
        }
        user.worlds.push(data.name);
        transactionItems.push({
            Put: {
                TableName: userTable,
                Item: user
            }
        });
    } else if (model === Collection) {
        // if collection, add it to the world
        const worldPrefix = 'WORLD#';
        const worldParams = {
            TableName: dataTable,
            Key: {
                PK: worldPrefix,
                SK: data.worldId
            }
        };
        const worldData = await ddbDocClient.send(new GetCommand(worldParams));
        if (!worldData.Item) {
            throw new Error("World not found");
        }
        const world = worldData.Item;
        if (!world.collections) {
            world.collections = [];
        }
        world.collections.push(data.name);
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: world
            }
        });
    } else if (model === Entry) {
        // if entry, add it to the collection
        const collectionPrefix = 'COLLECTION#' + worldId;
        const collectionParams = {
            TableName: dataTable,
            Key: {
                PK: collectionPrefix,
                SK: data.collectionId
            }
        };
        const collectionData = await ddbDocClient.send(new GetCommand(collectionParams));
        if (!collectionData.Item) {
            throw new Error("Collection not found");
        }
        const collection = collectionData.Item;
        if (!collection.entries) {
            collection.entries = [];
        }
        collection.entries.push(data.name);
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: collection
            }
        });
    }

    try {
        const result = await ddbDocClient.send(new TransactWriteCommand({
            TransactItems: transactionItems
        }));
        return dynamo_get(data.verify(result.Attributes), table);
    } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
    }
}

async function dynamo_update(data, table = dataTable) {
    
    const newItem = update(data, table);

    const updateExpression = Object.keys(newItem).map(key => `#${key} = :${key}`).join(', ');
    const expressionAttributeNames = Object.keys(newItem).reduce((acc, key) => {
        acc[`#${key}`] = key;
        return acc;
    }, {});
    const expressionAttributeValues = Object.keys(newItem).reduce((acc, key) => {
        acc[`:${key}`] = newItem[key];
        return acc;
    }, {});

    const params = {
        TableName: table,
        Key: {
            PK: data.pk(),
            SK: data.name
        },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
    };

    try {
        const res = await ddbDocClient.send(new UpdateCommand(params));
        if (!res.Attributes) {
            throw new Error("Item not found");
        }
        // create a new instance of the model with the data
        const item = data.verify(res.Attributes);
        if (!item) {
            throw new Error("Invalid item data");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(item)
        };
    } catch (err) {
        console.error("Error updating item:", err);
        throw new Error("Error updating item");
    }
}

async function dynamo_delete(data) {
    // Delete an item from the database and update associated items

    // get the item to delete
    const item = await dynamo_get(data, table);
    
    let worldIds = [];
    let collectionIds = [];
    let entryIds = [];

    // if the item is a user, get all the worlds with their id
    if (item instanceof User) {
        worldIds = item.worlds;
    }
    else if (item instanceof World) {
        worldIds = [item.name];
        collectionIds = item.collections;
    }
    else if (item instanceof Collection) {
        collectionIds = [item.name];
        entryIds = item.entries;
    }
    else if (item instanceof Entry) {
        entryIds = [item.name];
    }

    let transactionItems = [];

    for (const worldId of worldIds) {
        // get the world
        const worldParams = {
            TableName: dataTable,
            Key: {
                PK: 'WORLD#',
                SK: worldId
            }
        };
        const worldData = await ddbDocClient.send(new GetCommand(worldParams));
        if (!worldData.Item) {
            throw new Error("World not found");
        }
        const world = worldData.Item;
        
        // add the world to the transaction items
        transactionItems.push({
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: 'WORLD#',
                    SK: worldId
                }
            }
        });

        // 

    }
}


export {
    crud,
    dynamo_get,
    dynamo_list,
    dynamo_create,
    dynamo_update,
    dynamo_delete
};