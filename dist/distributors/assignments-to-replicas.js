"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeAssignmentsToNodesOptimized = exports.distributeAssignmentsToNodesBalanced = void 0;
/** From replica ids pick the one with fewest assignments to balance the load across brokers */
const distributeAssignmentsToNodesBalanced = (assignment, topicPartitionReplicaIds) => {
    const replicaPartitions = getPartitionsByReplica(assignment, topicPartitionReplicaIds);
    const result = {};
    for (const [topicName, partitions] of Object.entries(assignment)) {
        for (const partition of partitions) {
            const replicaIds = topicPartitionReplicaIds[topicName][partition];
            const replicaId = replicaIds.reduce((prev, curr) => {
                if (!prev) {
                    return curr;
                }
                return (replicaPartitions[prev]?.length ?? 0) < (replicaPartitions[curr]?.length ?? 0) ? prev : curr;
            });
            result[replicaId] ??= {};
            result[replicaId][topicName] ??= [];
            result[replicaId][topicName].push(partition);
        }
    }
    return result;
};
exports.distributeAssignmentsToNodesBalanced = distributeAssignmentsToNodesBalanced;
/** Minimize the total number of replicas in the result to reduce the number of requests to different brokers */
const distributeAssignmentsToNodesOptimized = (assignment, topicPartitionReplicaIds) => {
    const result = {};
    const sortFn = ([, partitionsA], [, partitionsB]) => partitionsB.length - partitionsA.length;
    let replicaPartitions = getPartitionsByReplica(assignment, topicPartitionReplicaIds);
    while (replicaPartitions.length) {
        replicaPartitions.sort(sortFn);
        const [replicaId, partitions] = replicaPartitions.shift();
        if (!partitions.length) {
            continue;
        }
        result[parseInt(replicaId)] = partitions.reduce((acc, partition) => {
            const [topicName, partitionId] = partition.split(':');
            acc[topicName] ??= [];
            acc[topicName].push(parseInt(partitionId));
            return acc;
        }, {});
        replicaPartitions = replicaPartitions.map(([replicaId, replicaPartitions]) => [replicaId, replicaPartitions.filter((partition) => !partitions.includes(partition))]);
    }
    return result;
};
exports.distributeAssignmentsToNodesOptimized = distributeAssignmentsToNodesOptimized;
const getPartitionsByReplica = (assignment, topicPartitionReplicaIds) => {
    const partitionsByReplicaId = {};
    for (const [topicName, partitions] of Object.entries(assignment)) {
        for (const partition of partitions) {
            const replicaIds = topicPartitionReplicaIds[topicName][partition];
            for (const replicaId of replicaIds) {
                partitionsByReplicaId[replicaId] ??= [];
                partitionsByReplicaId[replicaId].push(`${topicName}:${partition}`);
            }
        }
    }
    return Object.entries(partitionsByReplicaId);
};
