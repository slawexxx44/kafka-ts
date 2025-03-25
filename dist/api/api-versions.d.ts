export declare const API_VERSIONS: import("../utils/api.js").Api<unknown, {
    errorCode: number;
    versions: {
        apiKey: number;
        minVersion: number;
        maxVersion: number;
    }[];
    throttleTimeMs: number;
}>;
