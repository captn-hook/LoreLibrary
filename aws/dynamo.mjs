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

const ddbClient = new DynamoDBClient({ region: "us-west-2" });

const dataTable = process.env.DATA_TABLE;
const userTable = process.env.USER_TABLE;

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

function crud(operation, model, data, username, worldId, collectionId) {
    switch (operation) {
        case 'POST':
            if (!username) { return badRequest('Invalid authentication'); }
            return dynamo_create(data, model, username, worldId, collectionId);
        case 'GET':
            return dynamo_get(model, data, worldId, collectionId);
        case 'PUT':
            if (!username) { return badRequest('Invalid authentication'); }
            return dynamo_update(model, data, username, worldId);
        case 'DELETE':
            if (!username) { return badRequest('Invalid authentication'); }
            return dynamo_delete(model, data, username, worldId);
        default:
            throw new Error('Invalid operation');
    }
}

async function dynamo_get(instance, table = dataTable) {

    const params = {
        TableName: table,
        Key: {
            PK: instance.pk(),
            SK: instance.name
        }
    };

    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        if (!data.Item) {
            throw new Error("Item not found");
        }
        return new instance.constructor(data.Item);
    }
    catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
}

async function dynamo_list(model, username, worldId = '', table = dataTable) {
    if (!model || !model.name) {
        throw new Error("Invalid model: 'model.name' is required.");
    }
    if (!username) {
        throw new Error("Invalid username: 'username' is required.");
    }

    const prefix = model.name.toUpperCase() + '#' + worldId;

    const params = {
        TableName: table,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': prefix
        }
    };

    try {
        const data = await ddbDocClient.send(new QueryCommand(params));
        return data.Items.map(item => new model(item));
    } catch (err) {
        console.error("Error listing items:", err);
        throw new Error("Error listing items");
    }
}


async function dynamo_create(data, model, username, worldId = '', parentId = '', table = dataTable) {
    if (!model || !model.name) {
        throw new Error("Invalid model: 'model.name' is required.");
    }
    if (!data || !data.name) {
        throw new Error("Invalid data: 'data.name' is required.");
    }
    if (!username) {
        throw new Error("Invalid username: 'username' is required.");
    }

    const prefix = model.name.toUpperCase() + '#' + worldId;

    // Try to get the item in case it already exists
    const params = {
        TableName: table,
        Key: {
            PK: prefix,
            SK: data.name
        }
    };

    const existingItem = await ddbDocClient.send(new GetCommand(params));
    if (existingItem.Item) {
        throw new Error("Item already exists");
    }

    // Create a new item in the database and update associated items

    const pId = model === World ? username : parentId;

    let newItem;

    if (model === World) {
        newItem = {
            PK: prefix,
            SK: data.name,
            content: data.content || [],
            description: data.description || '',
            image: data.image || '',
            style: data.style || '',
            tags: data.tags || [],
            parentId: pId,
            ownerId: username,
            collections: []

        };
    } else if (model === Collection) {
        newItem = {
            PK: prefix,
            SK: data.name,
            content: data.content || [],
            tags: data.tags || [],
            parentId: pId,
            ownerId: username,
            collections: [],
            entries: []
        };
    } else if (model === Entry) {
        newItem = {
            PK: prefix,
            SK: data.name,
            content: data.content || [],
            tags: data.tags || [],
            parentId: pId,
            ownerId: username
        };
    } else {
        throw new Error("Invalid model: 'model' must be World, Collection, or Entry.");
    }

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
                SK: username
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
        return dynamo_get_id(model, data.name, data.worldId);
    } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
    }
}

async function dynamo_update(model, data, username, wolrdId = '', table = dataTable) {
    if (!model || !model.name) {
        throw new Error("Invalid model: 'model.name' is required.");
    }
    if (!data || !data.id) {
        throw new Error("Invalid data: 'data.id' is required.");
    }
    if (!username) {
        throw new Error("Invalid username: 'username' is required.");
    }
    // Update an existing item in the database
    const prefix = model.name.toUpperCase() + '#' + wolrdId;
    const params = {
        TableName: table,
        Key: {
            PK: prefix,
            SK: data.id
        },
        UpdateExpression: 'SET #data = :data',
        ExpressionAttributeNames: {
            '#data': 'data'
        },
        ExpressionAttributeValues: {
            ':data': data
        }
    };

    try {
        const result = await ddbDocClient.send(new UpdateCommand(params));
        return result.Attributes;
    } catch (err) {
        console.error("Error updating item:", err);
        throw new Error("Error updating item");
    }
}

async function dynamo_delete(model, id, username, wolrdId = '', table = dataTable) {
    // Delete an item from the database and update associated items
    const prefix = model.name.toUpperCase() + '#' + wolrdId;

    // get the item to delete
    const item = await dynamo_get_id(model, id, wolrdId);
    if (!item) {
        throw new Error("Item not found");
    }
    if (!item.ownerId || item.ownerId !== username) {
        throw new Error("Unauthorized");
    }

    let associatedItems = [];

    let children = [];

    // if the item has collections or entries, add them to the children array
    if (item.collections) {
        children = children.concat(item.collections);
    }
    if (item.entries) {
        children = children.concat(item.entries);
    }

    // while there are children, get the item and add it to the associatedItems array,
    // add its children to the children array
    while (children.length > 0) {
        const childId = children.pop();
        const child = await dynamo_get_id(model, childId, wolrdId);
        if (!child) {
            throw new Error("Child not found");
        }
        associatedItems.push(child);
        if (child.collections) {
            children = children.concat(child.collections);
        }
        if (child.entries) {
            children = children.concat(child.entries);
        }
    }

    // delete item and all associated items
    let transactionItems = [];

    transactionItems.push({
        Delete: {
            TableName: table,
            Key: {
                PK: prefix,
                SK: id
            }
        }
    });

    for (const item of associatedItems) {
        transactionItems.push({
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: item.PK,
                    SK: item.SK
                }
            }
        });
    }

    // remove this item from its parent
    if (item.parentId) {
        const parentTable = model.name === 'World' ? userTable : dataTable;
        const parent = await dynamo_get_id(model, item.parentId, wolrdId, parentTable);
        if (!parent) {
            throw new Error("Parent not found");
        }
        const index = parent.collections.indexOf(id);
        if (index > -1) {
            parent.collections.splice(index, 1);
        }
        transactionItems.push({
            Put: {
                TableName: parentTable,
                Item: parent
            }
        });
    }

    try {
        const result = await ddbDocClient.send(new TransactWriteItemsCommand({
            TransactItems: transactionItems
        }));
        return item;
    } catch (err) {
        console.error("Error deleting item:", err);
        throw new Error("Error deleting item");
    }
}

async function dynamo_user_create(username) {
    // Create the user in DynamoDB
    const params = {
        TableName: userTable,
        Item: {
            PK: "USER#",
            SK: username,
            content: [],
            worlds: []
        }
    };
    await ddbDocClient.send(new PutCommand(params));
    console.log("User created in DynamoDB:", params.Item);
    return params.Item;
}

export {
    crud,
    dynamo_get,
    dynamo_list,
    dynamo_create,
    dynamo_update,
    dynamo_delete,
    dynamo_user_create,
};