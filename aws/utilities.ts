export function notFound(message: string) {
    return {
        statusCode: 404,
        body: JSON.stringify({ message })
    };
}

export function notImplemented(message: string) {
    return {
        statusCode: 501,
        body: JSON.stringify({ message })
    };
}

export function badRequest(message: string) {
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    };
}