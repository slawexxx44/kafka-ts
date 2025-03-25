"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffsetManager = void 0;
const api_1 = require("../api");
const messages_to_topic_partition_leaders_1 = require("../distributors/messages-to-topic-partition-leaders");
const tracer_1 = require("../utils/tracer");
const trace = (0, tracer_1.createTracer)('OffsetManager');
class OffsetManager {
    options;
    currentOffsets = {};
    pendingOffsets = {};
    constructor(options) {
        this.options = options;
    }
    getCurrentOffset(topic, partition) {
        return this.currentOffsets[topic]?.[partition] ?? 0n;
    }
    getPendingOffset(topic, partition) {
        return this.pendingOffsets[topic]?.[partition] ?? 0n;
    }
    resolve(topic, partition, offset) {
        this.pendingOffsets[topic] ??= {};
        this.pendingOffsets[topic][partition] = offset;
    }
    isResolved(message) {
        return (this.getCurrentOffset(message.topic, message.partition) > message.offset ||
            this.getPendingOffset(message.topic, message.partition) > message.offset);
    }
    flush(topicPartitions) {
        Object.entries(topicPartitions).forEach(([topic, partitions]) => {
            this.currentOffsets[topic] ??= {};
            partitions.forEach((partition) => {
                if (this.pendingOffsets[topic]?.[partition]) {
                    this.currentOffsets[topic][partition] = this.pendingOffsets[topic][partition];
                    delete this.pendingOffsets[topic][partition];
                }
            });
        });
    }
    async fetchOffsets(options) {
        const { metadata } = this.options;
        const topicPartitions = Object.entries(metadata.getAssignment()).flatMap(([topic, partitions]) => partitions.map((partition) => ({ topic, partition })));
        const nodeTopicPartitions = (0, messages_to_topic_partition_leaders_1.distributeMessagesToTopicPartitionLeaders)(topicPartitions, metadata.getTopicPartitionLeaderIds());
        await Promise.all(Object.entries(nodeTopicPartitions).map(([nodeId, topicPartitions]) => this.listOffsets({
            ...options,
            nodeId: parseInt(nodeId),
            nodeAssignment: Object.fromEntries(Object.entries(topicPartitions).map(([topicName, partitions]) => [topicName, Object.keys(partitions).map(Number)])),
        })));
    }
    async listOffsets({ nodeId, nodeAssignment, fromTimestamp, }) {
        const { cluster, isolationLevel } = this.options;
        const offsets = await cluster.sendRequestToNode(nodeId)(api_1.API.LIST_OFFSETS, {
            replicaId: -1,
            isolationLevel,
            topics: Object.entries(nodeAssignment)
                .flatMap(([topic, partitions]) => partitions.map((partition) => ({ topic, partition })))
                .map(({ topic, partition }) => ({
                name: topic,
                partitions: [
                    {
                        partitionIndex: partition,
                        currentLeaderEpoch: -1,
                        timestamp: fromTimestamp,
                    },
                ],
            })),
        });
        const topicPartitions = {};
        offsets.topics.forEach(({ name, partitions }) => {
            topicPartitions[name] ??= new Set();
            partitions.forEach(({ partitionIndex, offset }) => {
                topicPartitions[name].add(partitionIndex);
                this.resolve(name, partitionIndex, offset);
            });
        });
        this.flush(topicPartitions);
    }
}
exports.OffsetManager = OffsetManager;
