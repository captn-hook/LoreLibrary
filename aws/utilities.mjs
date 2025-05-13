export function notFound(message) {
    return {
        statusCode: 404,
        body: JSON.stringify({ message })
    };
}

export function notImplemented(message) {
    return {
        statusCode: 501,
        body: JSON.stringify({ message })
    };
}

export function badRequest(message) {
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    };
}