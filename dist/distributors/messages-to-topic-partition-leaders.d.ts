type TopicPartitionLeader = {
    [topicName: string]: {
        [partitionId: number]: number;
    };
};
type MessagesByNodeTopicPartition<T> = {
    [nodeId: number]: {
        [topicName: string]: {
            [partitionId: number]: T[];
        };
    };
};
export declare const distributeMessagesToTopicPartitionLeaders: <T extends {
    topic: string;
    partition: number;
}>(messages: T[], topicPartitionLeader: TopicPartitionLeader) => MessagesByNodeTopicPartition<T>;
export {};
