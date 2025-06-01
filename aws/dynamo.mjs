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
import { World, Collection, Entry, User } from "./classes.mjs";


const ddbClient = new DynamoDBClient({ region: "us-west-2" });

const dataTable = process.env.DATA_TABLE;
const userTable = process.env.USER_TABLE;

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

function dynamo_to_item(item, model) {
    console.log('dynamo_to_item', item, model);
    if (model === User) {
        item.username = item.SK
    } else {
        if (model === World) {
            item.worldId = item.SK
        } else if (model === Collection) {
            if (!item.worldId) {
                item.worldId = item.PK.split('#')[1];
            }
            if (!item.parentId) {
                item.parentId = item.worldId;
            }
        } else if (model === Entry) {
            if (!item.worldId) {
                item.worldId = item.PK.split('#')[1];
            }
        }
        item.name = item.SK;
    }
    delete item.PK;
    delete item.SK;
    console.log('dynamo_to_item after', item);
    item = model.verify(item);
    if (item === null) {
        throw new Error("Invalid item data");
    } 
    return item;
}

function crud(operation, model, body, username) {
    var table;
    if (model == User) {
        table = userTable;
        if (operation === 'GET' && body.username !== username) {
            return dynamo_get(new User(body.username), table);
        }
    } else {
        table = dataTable;
    }

    switch (operation) {
        case 'POST':
            if (!username) { return badRequest('Invalid authentication'); }
            return dynamo_update(body, model, table);
        case 'GET':
            if (model === User && !username) { return badRequest('Invalid authentication'); }

            if (!body) {
                body = {};
            } else if (!body.parentId) {
                body.parentId = null;
            } else if (!body.worldId) {
                body.worldId = null;
            }

            let gd;
            if (model === User) {
                gd = User.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else if (model === World) {
                gd = World.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else if (model === Collection) {
                gd = Collection.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else if (model === Entry) {
                gd = Entry.verify(body);
                if (gd === null) {
                    return badRequest('Invalid body');
                }
            } else {
                console.error('Invalid model:', model);
                return badRequest('Invalid model');
            }
            return dynamo_get(gd, table);
        case 'PUT':
            if (!username) { return badRequest('Invalid authentication'); }

            let pd = model.verify(body);
            if (pd === null) {
                return badRequest('Invalid body');
            }
            return dynamo_create(pd, table);
        case 'DELETE':
            if (!username) { return badRequest('Invalid authentication'); }

            let dd = model.verify(body);

            return dynamo_delete(dd, table);
        default:
            throw new Error('Invalid operation');
    }
}

async function dynamo_user_create(username) {
    // Create a new user in the user table
    const user = new User(username);
    const params = {
        TableName: userTable,
        Item: {
            PK: user.pk(),
            SK: user.sk(),
            content: user.content,
            worlds: user.worlds
        }
    };
    try {
        const res = await ddbDocClient.send(new PutCommand(params));
        console.log('User created:', res.$metadata.httpStatusCode);
        if (res.$metadata.httpStatusCode == '200') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "User created successfully" })
            };
        } else {
            throw new Error("Failed to create user");
        }
    } catch (err) {
        console.error("Error creating user:", err);
        throw new Error("Error creating user");
    }
}

async function update(data, instance, table = dataTable) {
    // get the item to update and replace any present keys
    const getParams = {
        TableName: table,
        Key: {
            PK: instance.pk(),
            SK: instance.sk()
        }
    };

    let item;
    try {
        const res = await ddbDocClient.send(new GetCommand(getParams));
        if (!res.Item) {
            throw new Error("Item not found");
        }
        item = dynamo_to_item(res.Item, instance.constructor);
        item = instance.constructor.verify(item);
        
    } catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }

    if (!item) {
        throw new Error("Item not found");
    }

    for (const key in data) {
        if (item.hasOwnProperty(key) && data[key] !== undefined) {
            item[key] = data[key];
        }
    }
    

    try {
        item = instance.constructor.verify(item);
        if (item === null) {
            throw new Error("Invalid item data");
        }    
       return item;
    } catch (err) {
        console.error("Error verifying item:", err);
        throw new Error("Error verifying item");
    }
}

async function get_sub_items(worldId, collectionName) {
    console.log('get_sub_items', worldId, collectionName);
    // Get all sub items of a collection
    let thisCollection = await dynamo_get(new Collection(collectionName, null, worldId)); // Await the asynchronous call
    let res = {};
    if (thisCollection.entries) {
        res['entries'] = thisCollection.entries;
    }
    if (thisCollection.collections) {
        for (const subCollectionName of thisCollection.collections) {
            res[subCollectionName] = await get_sub_items(worldId, subCollectionName); // Await the recursive call
        }
    }
    return res;
}

async function dynamo_get_map(worldId) {
    // Returns the full structure of documents in a world
    let world = await dynamo_get(new World(worldId)); // Await the asynchronous call
    let map = {};
    map['entries'] = world.entries || [];
    for (const collectionName of world.collections) {
        map[collectionName] = await get_sub_items(worldId, collectionName); // Await the asynchronous call
    }
    return map;
}

async function get_style(parentId, worldId) {
    console.log('get_style', parentId, worldId);
    // Get the style data for a world or collection 
    try {
        const parent = await dynamo_get(new Collection(parentId, null, worldId));
        if (parent && parent.style) {
            return parent.style;
        } else {
            // If no style is found, return a default style or an empty object
            return get_style(parent.parentId, worldId);
        }
    } catch (err) {
        console.error("Error getting style:", err);
        return ''; // Return an empty string or a default style if an error occurs
    }
}

async function dynamo_get(data, table = dataTable) {

    const params = {
        TableName: table,
        Key: {
            PK: data.pk(),
            SK: data.sk()
        }
    };


    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Item not found" })
            }
        }
        // update the item with the new data
        for (const key in data) {
            if (res.Item.hasOwnProperty(key) && data[key] !== undefined) {
                data[key] = res.Item[key];
            }
        }

        // if the style data is undefined, get its parent to fill it in
        if (!data.style) {
            data.style = await get_style(data.parentId, data.worldId);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    }
    catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
}

async function dynamo_list(model, sk = '') {

    let params;
    if (model === User) {
        //list all users in the user table
        params = {
            TableName: userTable,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'USER#'
            }
        };
    } else {
        const prefix = model.name.toUpperCase() + '#' + sk;
        params = {
            TableName: dataTable,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': prefix
            }
        };
    }
    try {
        let data = await ddbDocClient.send(new QueryCommand(params));
        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify([])
            };
        }
        // Convert each item in the list using dynamo_to_item
        const items = data.Items.map(item => dynamo_to_item(item, model));
        data = items;

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

    const params = {
        TableName: table,
        Key: {
            PK: data.pk(),
            SK: data.sk()
        }
    };

    let existingItem;
    try {
        existingItem = await ddbDocClient.send(new GetCommand(params));
    } catch (err) {
        console.log('Item not found, creating new item');
    }

    if (existingItem.Item) {
        console.error("Item already exists:", existingItem.Item);
        throw new Error("Item already exists");
    }

    const newItem = {
        PK: data.pk(),
        SK: data.sk(),
        ...data.getBody(),
    };

    let transactionItems = [];

    // add the new item to the transaction items
    transactionItems.push({
        Put: {
            TableName: dataTable,
            Item: newItem
        }
    });

    if (data instanceof World) {
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
    } else if (data instanceof Collection) {
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
    } else if (data instanceof Entry) {
        // if entry, add it to the collection
        const collectionParams = {
            TableName: dataTable,
            Key: {
                PK: data.worldId + '#COLLECTION',
                SK: data.parentId
            }
        };
        console.log('collectionParams', collectionParams);
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
        for (const key in data) {
            console.log('result', result);
            if (result.Attributes && result.Attributes.hasOwnProperty(key) && data[key] !== undefined) {
                data[key] = result.Attributes[key];
            }
        }
        return dynamo_get(data, table);
    } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
    }
}

async function dynamo_update(data, model, table = dataTable) {

    const newItem = await update(data, model.verify(data), table);
    const params = {
        TableName: table,
        Key: {
            PK: newItem.pk(),
            SK: newItem.sk()
        },
        UpdateExpression: "SET " + Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .map((key, index) => `#key${index} = :value${index}`)
            .join(", "),
        ExpressionAttributeNames: Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .reduce((acc, key, index) => {
                acc[`#key${index}`] = key;
                return acc;
            }, {}),
        ExpressionAttributeValues: Object.keys(newItem)
            .filter(key => key !== "PK" && key !== "SK") // Exclude PK and SK
            .reduce((acc, key, index) => {
                acc[`:value${index}`] = newItem[key];
                return acc;
            }, {}),
        ReturnValues: "ALL_NEW"
    };

    try {
        const res = await ddbDocClient.send(new UpdateCommand(params));
        if (!res.Attributes) {
            throw new Error("Item not found");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(dynamo_to_item(res.Attributes, model))
        };
    } catch (err) {
        console.error("Error updating item:", err);
        throw new Error("Error updating item");
    }
}

async function dynamo_delete(data) {
    // Delete an item from the database and update associated items

    // get the item to delete
    const item = await dynamo_get(data, table).body;

    // if the item is a user, get all the worlds with their id
    if (item instanceof User) {
        delete_user(item);
    }
    else if (item instanceof World) {
        delete_world(item);
    }
    else if (item instanceof Collection) {
        delete_collection(item);
    }
    else if (item instanceof Entry) {
        delete_entry(item);
    }
}

async function delete_user(user) {
    let transactionItems = [];

    for (const worldName of user.worlds) {
        const worldTsx = delete_world(new World(worldName, user.name, user.name), false);
        transactionItems.concat(worldTsx);
    }
    transactionItems.push({
        Delete: {
            TableName: userTable,
            Key: {
                PK: user.pk(),
                SK: user.sk()
            }
        }
    });

    try {
        const result = await ddbDocClient.send(new TransactWriteCommand({
            TransactItems: transactionItems
        }));
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (err) {
        console.error("Error deleting user:", err);
        throw new Error("Error deleting user");
    }
}

async function delete_world(world, final = true) {
    let transactionItems = [];

    for (const collectionName of world.collections) {
        const collectionTsx = delete_collection(new Collection(collectionName, null, world.name), false);
        transactionItems.concat(collectionTsx);
    }
    transactionItems.push({
        Delete: {
            TableName: dataTable,
            Key: {
                PK: world.pk(),
                SK: world.sk()
            }
        }
    });

    const usero = User.verify(world.parentId);

    // remove the world from the user
    const params = {
        TableName: userTable,
        Key: {
            PK: usero.pk(),
            SK: usero.sk()
        }
    };
    const userData = await ddbDocClient.send(new GetCommand(params));
    if (!userData.Item) {
        throw new Error("User not found");
    }
    const user = userData.Item;
    if (user.worlds) {
        user.worlds = user.worlds.filter(w => w !== world.name);
    }
    transactionItems.push({
        Put: {
            TableName: userTable,
            Item: user
        }
    });

    if (final) {
        try {
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (err) {
            console.error("Error deleting world:", err);
            throw new Error("Error deleting world");
        }
    }
    else {
        return transactionItems;
    }
}

async function delete_collection(collection, final = true) {
    let transactionItems = [];

    for (const entryName of collection.entries) {
        const entryTsx = delete_entry(new Entry(entryName, collection.name, collection.worldId), false);
        transactionItems.concat(entryTsx);
    }

    for (const collectionName of collection.collections) {
        const collectionTsx = delete_collection(new Collection(collectionName, null, collection.worldId), false);
        transactionItems.concat(collectionTsx);
    }

    transactionItems.push({
        Delete: {
            TableName: dataTable,
            Key: {
                PK: collection.pk(),
                SK: collection.sk()
            }
        }
    });

    try {
        const parent = await dynamo_get(new World(collection.worldId), dataTable).body;
        if (!parent) {
            throw new Error("Parent world not found");
        }
        // remove the collection from the world
        if (parent.collections) {
            parent.collections = parent.collections.filter(c => c !== collection.name);
        }
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: parent
            }
        });
    } catch (err) {
        // if the parent world isnt found, try to find parent collection
        const parent = await dynamo_get(new Collection(collection.parentId, null, collection.worldId)).body;
        if (!parent) {
            throw new Error("Parent collection not found");
        }
        // remove the collection from the parent collection
        if (parent.collections) {
            parent.collections = parent.collections.filter(c => c !== collection.name);
        }
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: parent
            }
        });
    }

    if (final) {
        try {
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (err) {
            console.error("Error deleting collection:", err);
            throw new Error("Error deleting collection");
        }
    }
    else {
        return transactionItems;
    }
}

async function delete_entry(entry, final = true) {
    if (final) {
        let transactionItems = [];
        const parent = (await dynamo_get(new Collection(entry.collectionId, null, entry.worldId))).body;
        if (!parent) {
            throw new Error("Parent collection not found");
        }
        // remove the entry from the collection
        if (parent.entries) {
            parent.entries = parent.entries.filter(e => e !== entry.name);
        }
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: parent
            }
        });
        transactionItems.push({
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: entry.pk(),
                    SK: entry.sk()
                }
            }
        });
        try {
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (err) {
            console.error("Error deleting entry:", err);
            throw new Error("Error deleting entry");
        }
    } else {
        return [{
            Delete: {
                TableName: dataTable,
                Key: {
                    PK: entry.pk(),
                    SK: entry.sk()
                }
            }
        }];
    }
}







export {
    crud,
    dynamo_get,
    dynamo_list,
    dynamo_create,
    dynamo_update,
    dynamo_delete,
    dynamo_user_create,
    dynamo_get_map,
};