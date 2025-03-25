export declare const DELETE_TOPICS: import("../utils/api").Api<{
    topics: {
        name: string | null;
        topicId: string | null;
    }[];
    timeoutMs?: number | undefined;
}, {
    _tag: void;
    throttleTimeMs: number;
    responses: {
        name: string | null;
        topicId: string;
        errorCode: number;
        errorMessage: string | null;
        _tag: void;
    }[];
    _tag2: void;
}>;
