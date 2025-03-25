export declare const KEY_TYPE: {
    GROUP: number;
    TRANSACTION: number;
};
export declare const FIND_COORDINATOR: import("../utils/api").Api<{
    keyType: number;
    keys: string[];
}, {
    _tag: void;
    throttleTimeMs: number;
    coordinators: {
        key: string | null;
        nodeId: number;
        host: string;
        port: number;
        errorCode: number;
        errorMessage: string | null;
        _tag: void;
    }[];
    _tag2: void;
}>;
