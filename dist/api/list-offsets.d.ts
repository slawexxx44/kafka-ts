import { IsolationLevel } from './fetch';
export declare const LIST_OFFSETS: import("../utils/api").Api<{
    replicaId: number;
    isolationLevel: IsolationLevel;
    topics: {
        name: string;
        partitions: {
            partitionIndex: number;
            currentLeaderEpoch: number;
            timestamp: bigint;
        }[];
    }[];
}, {
    _tag: void;
    throttleTimeMs: number;
    topics: {
        name: string;
        partitions: {
            partitionIndex: number;
            errorCode: number;
            timestamp: bigint;
            offset: bigint;
            leaderEpoch: number;
            _tag: void;
        }[];
        _tag: void;
    }[];
    _tag2: void;
}>;
