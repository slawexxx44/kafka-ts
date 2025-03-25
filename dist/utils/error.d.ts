export declare class KafkaTSError extends Error {
    constructor(message: string);
}
export declare class KafkaTSApiError<T = any> extends KafkaTSError {
    errorCode: number;
    errorMessage: string | null;
    response: T;
    apiName: string | undefined;
    request: unknown | undefined;
    constructor(errorCode: number, errorMessage: string | null, response: T);
}
export declare class ConnectionError extends KafkaTSError {
}
