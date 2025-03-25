/// <reference types="node" />
import EventEmitter from 'events';
import { IsolationLevel } from '../api/fetch';
import { Cluster } from '../cluster';
import { Message } from '../types';
import { Retrier } from '../utils/retrier';
export type ConsumerOptions = {
    topics: string[];
    groupId?: string | null;
    groupInstanceId?: string | null;
    rackId?: string;
    isolationLevel?: IsolationLevel;
    sessionTimeoutMs?: number;
    rebalanceTimeoutMs?: number;
    maxWaitMs?: number;
    minBytes?: number;
    maxBytes?: number;
    partitionMaxBytes?: number;
    allowTopicAutoCreation?: boolean;
    fromBeginning?: boolean;
    fromTimestamp?: bigint;
    retrier?: Retrier;
    onBatch: (messages: Required<Message>[], context: {
        resolveOffset: (message: Pick<Required<Message>, 'topic' | 'partition' | 'offset'>) => void;
    }) => unknown;
};
export declare class Consumer extends EventEmitter<{
    offsetCommit: [];
    heartbeat: [];
}> {
    private cluster;
    private options;
    private metadata;
    private consumerGroup;
    private offsetManager;
    private fetchManager?;
    private stopHook;
    constructor(cluster: Cluster, options: ConsumerOptions);
    start(): Promise<void>;
    close(force?: boolean): Promise<void>;
    private startFetchManager;
    private waitForReassignment;
    private process;
    private fetch;
}
