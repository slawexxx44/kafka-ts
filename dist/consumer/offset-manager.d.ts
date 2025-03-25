import { IsolationLevel } from '../api/fetch';
import { Cluster } from '../cluster';
import { ConsumerMetadata } from './consumer-metadata';
type OffsetManagerOptions = {
    cluster: Cluster;
    metadata: ConsumerMetadata;
    isolationLevel: IsolationLevel;
};
export declare class OffsetManager {
    private options;
    private currentOffsets;
    pendingOffsets: Record<string, Record<number, bigint>>;
    constructor(options: OffsetManagerOptions);
    getCurrentOffset(topic: string, partition: number): bigint;
    getPendingOffset(topic: string, partition: number): bigint;
    resolve(topic: string, partition: number, offset: bigint): void;
    isResolved(message: {
        topic: string;
        partition: number;
        offset: bigint;
    }): boolean;
    flush(topicPartitions: Record<string, Set<number>>): void;
    fetchOffsets(options: {
        fromTimestamp: bigint;
    }): Promise<void>;
    private listOffsets;
}
export {};
