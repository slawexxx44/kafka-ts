export type Retrier = (func: () => unknown) => Promise<void>;
export declare const createExponentialBackoffRetrier: ({ retries, initialDelayMs, maxDelayMs, multiplier, onFailure, }?: {
    retries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    onFailure?: (error: unknown) => unknown;
}) => Retrier;
export declare const defaultRetrier: Retrier;
