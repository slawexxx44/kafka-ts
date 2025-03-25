/// <reference types="node" />
export declare const SASL_AUTHENTICATE: import("../utils/api").Api<{
    authBytes: Buffer;
}, {
    _tag: void;
    errorCode: number;
    errorMessage: string | null;
    authBytes: Buffer | null;
    sessionLifetimeMs: bigint;
    _tag2: void;
}>;
