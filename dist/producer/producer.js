"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producer = void 0;
const api_1 = require("../api");
const messages_to_topic_partition_leaders_1 = require("../distributors/messages-to-topic-partition-leaders");
const partitioner_1 = require("../distributors/partitioner");
const metadata_1 = require("../metadata");
const delay_1 = require("../utils/delay");
const error_1 = require("../utils/error");
const lock_1 = require("../utils/lock");
const logger_1 = require("../utils/logger");
const shared_1 = require("../utils/shared");
const tracer_1 = require("../utils/tracer");
const trace = (0, tracer_1.createTracer)('Producer');
class Producer {
    cluster;
    options;
    metadata;
    producerId = 0n;
    producerEpoch = 0;
    sequences = {};
    partition;
    lock = new lock_1.Lock();
    constructor(cluster, options) {
        this.cluster = cluster;
        this.options = {
            ...options,
            allowTopicAutoCreation: options.allowTopicAutoCreation ?? false,
            partitioner: options.partitioner ?? partitioner_1.defaultPartitioner,
        };
        this.metadata = new metadata_1.Metadata({ cluster });
        this.partition = this.options.partitioner({ metadata: this.metadata });
    }
    async send(messages, { acks = -1 } = {}) {
        await this.ensureConnected();
        const { allowTopicAutoCreation } = this.options;
        const defaultTimestamp = BigInt(Date.now());
        const topics = new Set(messages.map((message) => message.topic));
        await this.lock.acquire([...topics].map((topic) => `metadata:${topic}`), () => this.metadata.fetchMetadataIfNecessary({ topics, allowTopicAutoCreation }));
        const partitionedMessages = messages.map((message) => {
            message.partition = this.partition(message);
            return message;
        });
        const nodeTopicPartitionMessages = (0, messages_to_topic_partition_leaders_1.distributeMessagesToTopicPartitionLeaders)(partitionedMessages, this.metadata.getTopicPartitionLeaderIds());
        try {
            await Promise.all(Object.entries(nodeTopicPartitionMessages).map(async ([nodeId, topicPartitionMessages]) => {
                await this.lock.acquire([`node:${nodeId}`], async () => {
                    const topicData = Object.entries(topicPartitionMessages).map(([topic, partitionMessages]) => ({
                        name: topic,
                        partitionData: Object.entries(partitionMessages).map(([partition, messages]) => {
                            const partitionIndex = parseInt(partition);
                            let baseTimestamp;
                            let maxTimestamp;
                            messages.forEach(({ timestamp = defaultTimestamp }) => {
                                if (!baseTimestamp || timestamp < baseTimestamp) {
                                    baseTimestamp = timestamp;
                                }
                                if (!maxTimestamp || timestamp > maxTimestamp) {
                                    maxTimestamp = timestamp;
                                }
                            });
                            return {
                                index: partitionIndex,
                                baseOffset: 0n,
                                partitionLeaderEpoch: -1,
                                attributes: 0,
                                lastOffsetDelta: messages.length - 1,
                                baseTimestamp: baseTimestamp ?? 0n,
                                maxTimestamp: maxTimestamp ?? 0n,
                                producerId: this.producerId,
                                producerEpoch: 0,
                                baseSequence: this.getSequence(topic, partitionIndex),
                                records: messages.map((message, index) => ({
                                    attributes: 0,
                                    timestampDelta: (message.timestamp ?? defaultTimestamp) - (baseTimestamp ?? 0n),
                                    offsetDelta: index,
                                    key: message.key ?? null,
                                    value: message.value,
                                    headers: Object.entries(message.headers ?? {}).map(([key, value]) => ({
                                        key,
                                        value,
                                    })),
                                })),
                            };
                        }),
                    }));
                    await this.cluster.sendRequestToNode(parseInt(nodeId))(api_1.API.PRODUCE, {
                        transactionalId: null,
                        acks,
                        timeoutMs: 30000,
                        topicData,
                    });
                    topicData.forEach(({ name, partitionData }) => {
                        partitionData.forEach(({ index, records }) => {
                            this.updateSequence(name, index, records.length);
                        });
                    });
                });
            }));
        }
        catch (error) {
            if (error instanceof error_1.KafkaTSApiError && error.errorCode === api_1.API_ERROR.NOT_LEADER_OR_FOLLOWER) {
                await this.metadata.fetchMetadata({ topics, allowTopicAutoCreation });
            }
            if (error instanceof error_1.KafkaTSApiError && error.errorCode === api_1.API_ERROR.OUT_OF_ORDER_SEQUENCE_NUMBER) {
                await this.initProducerId();
            }
            logger_1.log.warn('Reconnecting producer due to an unhandled error', { error });
            try {
                await this.cluster.disconnect();
                await this.cluster.connect();
            }
            catch (error) {
                logger_1.log.warn('Failed to reconnect producer', { error });
            }
            throw error;
        }
    }
    async close() {
        await this.cluster.disconnect();
    }
    ensureConnected = (0, shared_1.shared)(async () => {
        await this.cluster.ensureConnected();
        if (!this.producerId) {
            await this.initProducerId();
        }
    });
    async initProducerId() {
        try {
            const result = await this.cluster.sendRequest(api_1.API.INIT_PRODUCER_ID, {
                transactionalId: null,
                transactionTimeoutMs: 0,
                producerId: this.producerId,
                producerEpoch: this.producerEpoch,
            });
            this.producerId = result.producerId;
            this.producerEpoch = result.producerEpoch;
            this.sequences = {};
        }
        catch (error) {
            if (error.errorCode === api_1.API_ERROR.COORDINATOR_LOAD_IN_PROGRESS) {
                await (0, delay_1.delay)(100);
                return this.initProducerId();
            }
            throw error;
        }
    }
    getSequence(topic, partition) {
        return this.sequences[topic]?.[partition] ?? 0;
    }
    updateSequence(topic, partition, messagesCount) {
        this.sequences[topic] ??= {};
        this.sequences[topic][partition] ??= 0;
        this.sequences[topic][partition] += messagesCount;
    }
}
exports.Producer = Producer;
__decorate([
    trace(() => ({ root: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], Producer.prototype, "send", null);
