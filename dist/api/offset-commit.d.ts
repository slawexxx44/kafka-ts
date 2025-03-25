export declare const OFFSET_COMMIT: import("../utils/api").Api<{
    groupId: string;
    generationIdOrMemberEpoch: number;
    memberId: string;
    groupInstanceId: string | null;
    topics: {
        name: string;
        partitions: {
            partitionIndex: number;
            committedOffset: bigint;
            committedLeaderEpoch: number;
            committedMetadata: string | null;
        }[];
    }[];
}, {
    _tag: void;
    throttleTimeMs: number;
    topics: {
        name: string | null;
        partitions: {
            partitionIndex: number;
            errorCode: number;
            _tag: void;
        }[];
        _tag: void;
    }[];
    _tag2: void;
}>;
