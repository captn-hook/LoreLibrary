
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client();

async function s3_crud(path, operation, body, username) {
    switch (operation) {
        case 'GET':
            return await s3_get(path, username);
        case 'POST':
            if (!username) { return badRequest('Invalid authentication'); }
            return await s3_post(path, body, username);
        case 'PUT':
            if (!username) { return badRequest('Invalid authentication'); }
            return await s3_put(path, body, username);
        case 'DELETE':
            if (!username) { return badRequest('Invalid authentication'); }
            return await s3_delete(path, username);
        default:
            throw new Error('Invalid operation');
    }
}

async function s3_post(path, body, username) {
    // return a signed url for the object
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: path,
        Body: body,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
        statusCode: 200,
        body: JSON.stringify({ url }),
    };
}

async function s3_get(path, username) {
    // return a signed url for the object
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: path,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
        statusCode: 200,
        body: JSON.stringify({ url }),
    };
}

async function s3_put(path, body, username) {
    // return a signed url for the object
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: path,
        Body: body,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
        statusCode: 200,
        body: JSON.stringify({ url }),
    };
}

async function s3_delete(path, username) {
    // return a signed url for the object
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: path,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
        statusCode: 200,
        body: JSON.stringify({ url }),
    };
}

async function s3_list(path, username) {
    // return a signed url for the object
    const command = new ListObjectsCommand({
        Bucket: process.env.S3_BUCKET,
        Prefix: path,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
        statusCode: 200,
        body: JSON.stringify({ url }),
    };
}

export { s3_crud, s3_post, s3_get, s3_put, s3_delete, s3_list };