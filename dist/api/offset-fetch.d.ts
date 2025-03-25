export declare const OFFSET_FETCH: import("../utils/api").Api<{
    groups: {
        groupId: string;
        topics: {
            name: string;
            partitionIndexes: number[];
        }[];
    }[];
    requireStable: boolean;
}, {
    _tag: void;
    throttleTimeMs: number;
    groups: {
        groupId: string | null;
        topics: {
            name: string;
            partitions: {
                partitionIndex: number;
                committedOffset: bigint;
                committedLeaderEpoch: number;
                committedMetadata: string | null;
                errorCode: number;
                _tag: void;
            }[];
            _tag: void;
        }[];
        errorCode: number;
        _tag: void;
    }[];
    _tag2: void;
}>;
