export type Metadata = Awaited<ReturnType<(typeof METADATA)['response']>>;
export declare const METADATA: import("../utils/api").Api<{
    topics?: {
        id: string | null;
        name: string;
    }[] | null | undefined;
    allowTopicAutoCreation?: boolean | undefined;
    includeTopicAuthorizedOperations?: boolean | undefined;
}, {
    _tag: void;
    throttleTimeMs: number;
    brokers: {
        nodeId: number;
        host: string;
        port: number;
        rack: string | null;
        _tag: void;
    }[];
    clusterId: string | null;
    controllerId: number;
    topics: {
        errorCode: number;
        name: string;
        topicId: string;
        isInternal: boolean;
        partitions: {
            errorCode: number;
            partitionIndex: number;
            leaderId: number;
            leaderEpoch: number;
            replicaNodes: number[];
            isrNodes: number[];
            offlineReplicas: number[];
            _tag: void;
        }[];
        topicAuthorizedOperations: number;
        _tag: void;
    }[];
    _tag2: void;
}>;
