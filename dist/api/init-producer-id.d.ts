export declare const INIT_PRODUCER_ID: import("../utils/api").Api<{
    transactionalId: string | null;
    transactionTimeoutMs: number;
    producerId: bigint;
    producerEpoch: number;
}, {
    _tag: void;
    throttleTimeMs: number;
    errorCode: number;
    producerId: bigint;
    producerEpoch: number;
    _tag2: void;
}>;
