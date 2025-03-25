import { Cluster } from './cluster';
type MetadataOptions = {
    cluster: Cluster;
};
export declare class Metadata {
    private options;
    private topicPartitions;
    private topicNameById;
    private topicIdByName;
    private leaderIdByTopicPartition;
    private isrNodesByTopicPartition;
    constructor(options: MetadataOptions);
    getTopicPartitionLeaderIds(): Record<string, Record<number, number>>;
    getTopicPartitionReplicaIds(): Record<string, Record<number, number[]>>;
    getTopicPartitions(): Record<string, number[]>;
    getTopicIdByName(name: string): string;
    getTopicNameById(id: string): string;
    fetchMetadataIfNecessary({ topics, allowTopicAutoCreation, }: {
        topics: string[] | Set<string>;
        allowTopicAutoCreation: boolean;
    }): Promise<void>;
    fetchMetadata({ topics, allowTopicAutoCreation, }: {
        topics: string[] | Set<string> | null;
        allowTopicAutoCreation: boolean;
    }): Promise<void>;
}
export {};
