export declare const CREATE_TOPICS: import("../utils/api").Api<{
    topics: {
        name: string;
        numPartitions?: number;
        replicationFactor?: number;
        assignments?: {
            partitionIndex: number;
            brokerIds: number[];
        }[];
        configs?: {
            name: string;
            value: string | null;
        }[];
    }[];
    timeoutMs?: number | undefined;
    validateOnly?: boolean | undefined;
}, {
    _tag: void;
    throttleTimeMs: number;
    topics: {
        name: string | null;
        topicId: string;
        errorCode: number;
        errorMessage: string | null;
        numPartitions: number;
        replicationFactor: number;
        configs: {
            name: string | null;
            value: string | null;
            readOnly: boolean;
            configSource: number;
            isSensitive: boolean;
            _tag: void;
        }[];
        _tag: void;
    }[];
    _tag2: void;
}>;
