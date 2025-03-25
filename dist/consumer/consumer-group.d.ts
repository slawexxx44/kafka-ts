import { Cluster } from '../cluster';
import { Consumer } from './consumer';
import { ConsumerMetadata } from './consumer-metadata';
import { OffsetManager } from './offset-manager';
type ConsumerGroupOptions = {
    cluster: Cluster;
    topics: string[];
    groupId: string;
    groupInstanceId: string | null;
    sessionTimeoutMs: number;
    rebalanceTimeoutMs: number;
    metadata: ConsumerMetadata;
    offsetManager: OffsetManager;
    consumer: Consumer;
};
export declare class ConsumerGroup {
    private options;
    private coordinatorId;
    private memberId;
    private generationId;
    private leaderId;
    private memberIds;
    private heartbeatInterval;
    private heartbeatError;
    constructor(options: ConsumerGroupOptions);
    init(): Promise<void>;
    join(): Promise<void>;
    private startHeartbeater;
    private stopHeartbeater;
    handleLastHeartbeat(): void;
    private findCoordinator;
    private joinGroup;
    private syncGroup;
    private offsetFetch;
    offsetCommit(topicPartitions: Record<string, Set<number>>): Promise<void>;
    heartbeat(): Promise<void>;
    leaveGroup(): Promise<void>;
}
export {};
