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
    if (model === User) {
        item.username = item.SK
    } else {
        if (model === World) {
            item.worldId = item.SK
        } else if (model === Collection) {
            if (!item.worldId) {
                item.worldId = item.PK.split('#')[0];
            }
            if (!item.parentId) {
                item.parentId = item.worldId;
            }
        } else if (model === Entry) {
            if (!item.worldId) {
                item.worldId = item.PK.split('#')[0];
            }
        }
        item.name = item.SK;
    }
    delete item.PK;
    delete item.SK;
    item = model.verify(item);
    if (item === null) {
        throw new Error("Invalid item data");
    } 
    console.log("Converted item:", item);
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

            // display the type of the data
            console.log("Deleting item of type:", dd.constructor.name);

            return dynamo_delete(dd, table);
        default:
            throw new Error('Invalid operation');
    }
}

async function dynamo_find_collection(worldId, collectionName) {
    // Find a top level collection in a world, return true or false
    try {
        const collection = new Collection(collectionName, worldId, worldId);
        const params = {
            TableName: dataTable,
            Key: {
                PK: collection.pk(),
                SK: collection.sk()
            }
        };
        const res = await ddbDocClient.send(new GetCommand(params));
        console.log("Find collection response:", res);
        if (res.Item) {
            return true; // Collection exists
        } else {
            return false; // Collection does not exist
        }
    } catch (err) {
        console.error("Error finding collection:", err);
        throw new Error("Error finding collection");
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
    // Get all sub items of a collection
    let r = await dynamo_get(new Collection(collectionName, collectionName, worldId), dataTable, false);
    let thisCollection = JSON.parse(r.body);
    if (!thisCollection || !thisCollection['entries'] && !thisCollection['collections']) {
        console.error("Collection not found or empty:", collectionName);
        return {};
    }
    let res = {};
    if (thisCollection['entries']) {
        res['entries'] = thisCollection['entries'];
    }
    if (thisCollection['collections']) {
        res['collections'] = thisCollection['collections'];
        for (const subCollectionName of thisCollection['collections']) {
            res[subCollectionName] = await get_sub_items(worldId, subCollectionName); 
        }
    }
    return res;
}

async function dynamo_get_map(worldId) {
    // Returns the full structure of documents in a world
    let g = new World(worldId);
    const params = {
        TableName: dataTable,
        Key: {
            PK: g.pk(),
            SK: g.sk()
        }
    };

    let world;
    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            throw new Error("World not found");
        }
        world = dynamo_to_item(res.Item, World);
    } catch (err) {
        console.error("Error getting world:", err);
        throw new Error("Error getting world");
    }

    if (!world) {
        throw new Error("World not found");
    }

    let map = {};
    map['entries'] = world['entries'] || [];
    map['collections'] = world['collections'] || [];
    for (const collectionName of map['collections']) {
        map[collectionName] = await get_sub_items(worldId, collectionName);
    }
    return map;
}

async function get_style(parentId, worldId) {
    // Get the style data for a world or collection 
    try {
        try {
            let parent = await JSON.parse((await dynamo_get(new Collection(parentId, null, worldId), dataTable)).body)
            parent = Collection.verify(parent);
            if (parent && parent.style !== '') {
                return parent.style;
            } else {
                // If no style is found, return a default style or an empty object
                return get_style(parent.parentId, worldId);
            }
        } catch (err) {
            // try to get the style from the world
            let world = await JSON.parse((await dynamo_get(new World(worldId), dataTable)).body);
            world = World.verify(world);
            if (world && world.style) {
                return world.style;
            } else {
                // If no style is found, return a default style or an empty object
                return '';
            }
        }
    } catch (err) {
        console.error("Error getting style:", err);
        return ''; // Return an empty string or a default style if an error occurs
    }
}

async function dynamo_get(data, table = dataTable, getStyle = true) {

    console.log("Getting item of type:", data.constructor.name);
    console.log("Getting item:", data.pk(), data.sk());

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
            console.error("Item not found:", data);
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
        if (getStyle && !(data instanceof World) && !(data instanceof User) && data.style === '') {
            data.style = await get_style(data.parentId, data.worldId);
        }
        // convert the item to the correct model
        data = dynamo_to_item(res.Item, data.constructor);
        console.log("Item retrieved successfully:", data);
        return {
            statusCode: 200,
            body: JSON.stringify(data.getBody())
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

    console.log("Creating item of type:", data.constructor.name);
    console.log("Creating item:", data.pk(), data.sk());

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
        console.log("Existing item:", existingItem);
    } catch (err) {
        console.error('Item not found, creating new item');
    }

    if (existingItem.Item) {
        console.error("Item already exists:", existingItem.Item);
        // return error code 409
        return {
            statusCode: 409,
            body: JSON.stringify({ message: "Item already exists" })
        }
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
        if (!world['collections']) {
            world['collections'] = [];
        }
        world['collections'].push(data.name);
        transactionItems.push({
            Put: {
                TableName: dataTable,
                Item: world
            }
        });
    } else if (data instanceof Entry) {
        try {
            // if entry, add it to the collection
            const collectionParams = {
                TableName: dataTable,
                Key: {
                    PK: data.worldId + '#COLLECTION',
                    SK: data.parentId
                }
            };
            const collectionData = await ddbDocClient.send(new GetCommand(collectionParams));
            if (!collectionData.Item) {
                throw new Error("Collection not found");
            }
            const collection = collectionData.Item;
            if (!collection['entries']) {
                collection['entries'] = [];
            }
            collection['entries'].push(data.name);
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: collection
                }
            });
        } catch (err) {
            // try to get the parent world instead
            console.error("Error getting parent collection:", err);
            console.log("Trying to get parent world instead...: ", data.parentId);
            const worldParams = {
                TableName: dataTable,
                Key: {
                    PK: 'WORLD#',
                    SK: data.worldId
                }
            };
            const worldData = await ddbDocClient.send(new GetCommand(worldParams));
            if (!worldData.Item) {
                throw new Error("World not found");
            }
            const world = worldData.Item;
            if (!world['entries']) {
                world['entries'] = [];
            }
            world['entries'].push(data.name);
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: world
                }
            });
        }
    }

    try {
        const result = await ddbDocClient.send(new TransactWriteCommand({
            TransactItems: transactionItems
        }));
        for (const key in data) {
            if (result.Attributes && result.Attributes.hasOwnProperty(key) && data[key] !== undefined) {
                data[key] = result.Attributes[key];
            }
        }
        console.log("Item created successfully:", data);
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
    console.log("Deleting item of type:", data.constructor.name);

    console.log("Deleting item:", data.pk(), data.sk());
    // get the item to delete
    const params = {
        TableName: dataTable,
        Key: {
            PK: data.pk(),
            SK: data.sk()
        }
    };

    let item;
    try {
        const res = await ddbDocClient.send(new GetCommand(params));
        if (!res.Item) {
            console.error("Item not found:", data);
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Item not found" })
            };
        }
        item = dynamo_to_item(res.Item, data.constructor);
    } catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error getting item");
    }
    if (!item) {
        console.error("Item not found:", data);
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Item not found" })
        };
    }

    // if the item is a user, get all the worlds with their id
    if (item instanceof User) {
        console.log("Deleting user:", item.username);
        return delete_user(item);
    }
    else if (item instanceof World) {
        console.log("Deleting world:", item.name);
        return delete_world(item);
    }
    else if (item instanceof Collection) {
        console.log("Deleting collection:", item.name);
        return delete_collection(item);
    }
    else if (item instanceof Entry) {
        console.log("Deleting entry:", item.name);
        return delete_entry(item);
    } else {
        throw new Error("Invalid item type for deletion");
    }
}

async function delete_user(user) {
    let transactionItems = [];

    for (const worldName of user.worlds) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: 'WORLD#',
                SK: worldName
            }
        };
        const worldData = await ddbDocClient.send(new GetCommand(params));
        if (!worldData.Item) {
            console.error("World not found:", worldName);
            continue; // Skip if world not found
        }
        const w = dynamo_to_item(worldData.Item, World);
        if (!w) {
            console.error("Invalid world data:", worldData.Item);
            continue; // Skip if invalid world data
        }
        const worldTsx = await delete_world(w, false, false);
        transactionItems = transactionItems.concat(worldTsx); // Fix concat issue
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
            body: JSON.stringify({ message: "User deleted successfully" })
        };
    } catch (err) {
        console.error("Error deleting user:", err);
        throw new Error("Error deleting user");
    }
}

async function delete_world(world, final = true, updateUser = true) {
    let transactionItems = [];
    
    for (const collectionName of world['collections'] || []) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: world.pk(),
                SK: collectionName
            }
        };
        const collectionData = await ddbDocClient.send(new GetCommand(params));
        if (!collectionData.Item) {
            console.error("Collection not found:", collectionName);
            continue; // Skip if collection not found
        }
        const col = dynamo_to_item(collectionData.Item, Collection);
        if (!col) {
            console.error("Invalid collection data:", collectionData.Item);
            continue; // Skip if invalid collection data
        }
        const collectionTsx = await delete_collection(col, false, false);
        transactionItems = transactionItems.concat(collectionTsx); // Fix concat issue
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

    console.log("Deleting world:", world.name, "with ownerId:", world.parentId);
    if (updateUser) {
        const usero = new User(world.parentId);

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
        // turn the item into a dynamo item
        const u = {
            PK: user.PK,
            SK: user.SK,
            worlds: user.worlds || [],
            content: user.content || [],
        };
        transactionItems.push({
            Put: {
                TableName: userTable,
                Item: u
            }
        });
    }

    if (final) {
        try {
            console.log("Executing transaction with items:", transactionItems);
            for (const item of transactionItems) {
                console.log("Transaction item:", item);
            }
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "World deleted successfully" })
            };
        } catch (err) {
            console.error("Error deleting world:", err);
            throw new Error("Error deleting world");
        }
    } else {
        return transactionItems;
    }
}

async function delete_collection(collection, final = true, updateParent = true) {
    console.log("Deleting collection:", collection.pk(), collection.sk());
    let transactionItems = [];

    console.log("Collection entries:", collection['entries']);
    for (const entryName of collection['entries']) {
        console.log("Deleting entry:", entryName, "from collection:", collection.name);
        const params = {
            TableName: dataTable,
            Key: {
                PK: collection.pk(),
                SK: entryName
            }
        };
        const entryData = await ddbDocClient.send(new GetCommand(params));
        if (!entryData.Item) {
            console.error("Entry not found:", entryName);
            continue; // Skip if entry not found
        }
        const ent = dynamo_to_item(entryData.Item, Entry);
        if (!ent) {
            console.error("Invalid entry data:", entryData.Item);
            continue; // Skip if invalid entry data
        }
        const entryTsx = await delete_entry(ent, false, false);
        transactionItems = transactionItems.concat(entryTsx); // Fix concat issue
    }

    for (const collectionName of collection['collections']) {
        const params = {
            TableName: dataTable,
            Key: {
                PK: collection.pk(),
                SK: collectionName
            }
        };
        const collectionData = await ddbDocClient.send(new GetCommand(params));
        if (!collectionData.Item) {
            console.error("Sub-collection not found:", collectionName);
            continue; // Skip if sub-collection not found
        }
        const col = dynamo_to_item(collectionData.Item, Collection);
        if (!col) {
            console.error("Invalid sub-collection data:", collectionData.Item);
            continue; // Skip if invalid sub-collection data
        }
        const collectionTsx = await delete_collection(col, false, false);
        transactionItems = transactionItems.concat(collectionTsx); // Fix concat issue
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

    if (updateParent) {
        try {
            const params = {
                TableName: dataTable,
                Key: {
                    PK: 'WORLD#',
                    SK: collection.worldId
                }
            };
            let parentData = await ddbDocClient.send(new GetCommand(params));
            if (!parentData.Item) {
                console.log("Parent world not found, trying to get parent collection instead...");
                throw new Error("Parent world not found");
            }
            let parent = dynamo_to_item(parentData.Item, World);
            if (!parent) {
                console.error("Invalid parent world data:", parentData.Item);
                throw new Error("Invalid parent world data");
            }
            if (parent['collections']) {
                parent['collections'] = parent['collections'].filter(c => c !== collection.name);
            }
            // turn the item into a dynamo item
            const p = {
                PK: parent.pk(),
                SK: parent.sk(),
                ...parent.getBody(),
            };
            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: p
                }
            });
        } catch (err) {
            console.log("Error getting parent world:", err);
            console.log("Trying to get parent collection instead...: ", collection.parentId);
            const params = {
                TableName: dataTable,
                Key: {
                    PK: collection.parentId + '#COLLECTION',
                    SK: collection.worldId
                }
            };
            let parentData = await ddbDocClient.send(new GetCommand(params));
            if (!parentData.Item) {
                console.error("Parent collection not found:", collection.parentId);
                throw new Error("Parent collection not found");
            }
            let parent = dynamo_to_item(parentData.Item, Collection);
            if (!parent) {
                console.error("Invalid parent collection data:", parentData.Item);
                throw new Error("Invalid parent collection data");
            }
            if (parent['collections']) {
                parent['collections'] = parent['collections'].filter(c => c !== collection.name);
            }

            const p = {
                PK: parent.pk(),
                SK: parent.sk(),
                ...parent.getBody(),
            };

            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: p
                }
            });
        }
    }

    if (final) {
        try {
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Collection deleted successfully" })
            };
        } catch (err) {
            console.error("Error deleting collection:", err);
            throw new Error("Error deleting collection");
        }
    } else {
        return transactionItems;
    }
}

async function delete_entry(entry, final = true, updateParent = true) {
    console.log("Deleting entry: ", entry);
    console.log("Deleting entry:", entry.pk(), entry.sk());
    if (final) {
        let transactionItems = [];
        if (updateParent) {
            let parent;
            try {
                try {
                    const col = new Collection(entry.parentId, null, entry.worldId);
                    console.log("Deleting entry from collection:", col.pk(), col.sk());
                    const params = {
                        TableName: dataTable,
                        Key: {
                            PK: col.pk(),
                            SK: col.sk()
                        }
                    };
                    let parentData = await ddbDocClient.send(new GetCommand(params));
                    if (!parentData.Item) {
                        console.error("Parent collection not found:", col);
                        throw new Error("Parent collection not found");
                    }   
                    parent = dynamo_to_item(parentData.Item, Collection);
                    if (!parent) {
                        console.error("Invalid parent collection data:", parentData.Item);
                        throw new Error("Invalid parent collection data");
                    }
                } catch (err) {
                    console.error("Error getting parent collection:", err);
                    console.log("Trying to get parent world instead...: ", entry.parentId);
                    const params = {
                        TableName: dataTable,
                        Key: {
                            PK: entry.parentId + '#',
                            SK: entry.worldId
                        }
                    };
                    let parentData = await ddbDocClient.send(new GetCommand(params));
                    if (!parentData.Item) {
                        console.error("Parent world not found:", entry.parentId);
                        throw new Error("Parent world not found");
                    }
                    parent = dynamo_to_item(parentData.Item, World);
                    
                    if (!parent) {
                        throw new Error("Parent world not found");
                    }
                }
            } catch (err) {
                console.error("Error getting parent collection or world:", err);
                throw new Error("Error getting parent collection or world");
            }

            if (!parent) {
                console.error("Parent collection or world not found for entry:", entry);
                throw new Error("Parent collection or world not found");
            }   

            if (parent['entries']) {
                parent['entries'] = parent['entries'].filter(e => e !== entry.name);
            }

            // turn the item into a dynamo item
            const p = {
                PK: parent.pk(),
                SK: parent.sk(),
                ...parent.getBody(),
            };

            transactionItems.push({
                Put: {
                    TableName: dataTable,
                    Item: p
                }
            });
        }
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
            console.log("Executing transaction with items:", transactionItems);
            for (const item of transactionItems) {
                console.log("Transaction item:", item);
            }
            const result = await ddbDocClient.send(new TransactWriteCommand({
                TransactItems: transactionItems
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Entry deleted successfully" })
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
    dynamo_find_collection
};