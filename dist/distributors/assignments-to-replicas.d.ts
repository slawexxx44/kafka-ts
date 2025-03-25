type Assignment = {
    [topicName: string]: number[];
};
type TopicPartitionReplicaIds = {
    [topicName: string]: {
        [partition: number]: number[];
    };
};
type NodeAssignment = {
    [replicaId: number]: Assignment;
};
/** From replica ids pick the one with fewest assignments to balance the load across brokers */
export declare const distributeAssignmentsToNodesBalanced: (assignment: Assignment, topicPartitionReplicaIds: TopicPartitionReplicaIds) => NodeAssignment;
/** Minimize the total number of replicas in the result to reduce the number of requests to different brokers */
export declare const distributeAssignmentsToNodesOptimized: (assignment: Assignment, topicPartitionReplicaIds: TopicPartitionReplicaIds) => NodeAssignment;
export {};
