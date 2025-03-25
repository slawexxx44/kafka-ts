/// <reference types="node" />
export declare const generateNonce: () => string;
export declare const saltPassword: (password: string, salt: string, iterations: number, keyLength: number, digest: string) => Promise<Buffer>;
export declare const base64Encode: (input: Buffer | string) => string;
export declare const base64Decode: (input: string) => string;
export declare const hash: (data: Buffer, digest: string) => Buffer;
export declare const hmac: (key: Buffer, data: Buffer | string, digest: string) => Buffer;
export declare const xor: (a: Buffer, b: Buffer) => Buffer;
