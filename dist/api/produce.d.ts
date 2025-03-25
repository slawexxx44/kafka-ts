export declare const PRODUCE: import("../utils/api.js").Api<{
    transactionalId: string | null;
    acks: number;
    timeoutMs: number;
    topicData: {
        name: string;
        partitionData: {
            index: number;
            baseOffset: bigint;
            partitionLeaderEpoch: number;
            attributes: number;
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
    }[];
}, {
    _tag: void;
    responses: {
        name: string | null;
        partitionResponses: {
            index: number;
            errorCode: number;
            baseOffset: bigint;
            logAppendTime: bigint;
            logStartOffset: bigint;
            recordErrors: {
                batchIndex: number;
                batchIndexError: number;
                _tag: void;
            }[];
            errorMessage: string | null;
            _tag: void;
        }[];
        _tag: void;
    }[];
    throttleTimeMs: number;
    _tag2: void;
}>;
