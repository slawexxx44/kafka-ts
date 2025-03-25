export declare const enum IsolationLevel {
    READ_UNCOMMITTED = 0,
    READ_COMMITTED = 1
}
export type FetchResponse = Awaited<ReturnType<(typeof FETCH)['response']>>;
export declare const FETCH: import("../utils/api").Api<{
    maxWaitMs: number;
    minBytes: number;
    maxBytes: number;
    isolationLevel: IsolationLevel;
    sessionId: number;
    sessionEpoch: number;
    topics: {
        topicId: string;
        partitions: {
            partition: number;
            currentLeaderEpoch: number;
            fetchOffset: bigint;
            lastFetchedEpoch: number;
            logStartOffset: bigint;
            partitionMaxBytes: number;
        }[];
    }[];
    forgottenTopicsData: {
        topicId: string;
        partitions: number[];
    }[];
    rackId: string;
}, {
    _tag: void;
    throttleTimeMs: number;
    errorCode: number;
    sessionId: number;
    responses: {
        topicId: string;
        partitions: {
            partitionIndex: number;
            errorCode: number;
            highWatermark: bigint;
            lastStableOffset: bigint;
            logStartOffset: bigint;
            abortedTransactions: {
                producerId: bigint;
                firstOffset: bigint;
                _tag: void;
            }[];
            preferredReadReplica: number;
            records: {
                baseOffset: bigint;
                batchLength: number;
                partitionLeaderEpoch: number;
                magic: number;
                crc: number;
                attributes: number;
                compression: number;
                timestampType: string;
                isTransactional: boolean;
                isControlBatch: boolean;
                hasDeleteHorizonMs: boolean;
                lastOffsetDelta: number;
                baseTimestamp: bigint;
                maxTimestamp: bigint;
                producerId: bigint;
                producerEpoch: number;
                baseSequence: number;
                records: {
                    attributes: number;
                    timestampDelta: bigint;
                    offsetDelta: number;
                    key: string | null;
                    value: string | null;
                    headers: {
                        key: string;
                        value: string;
                    }[];
                }[];
            }[];
            _tag: void;
        }[];
        _tag: void;
    }[];
    _tag2: void;
}>;
