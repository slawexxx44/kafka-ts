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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = void 0;
const events_1 = __importDefault(require("events"));
const api_1 = require("../api");
const messages_to_topic_partition_leaders_1 = require("../distributors/messages-to-topic-partition-leaders");
const delay_1 = require("../utils/delay");
const error_1 = require("../utils/error");
const logger_1 = require("../utils/logger");
const retrier_1 = require("../utils/retrier");
const tracer_1 = require("../utils/tracer");
const consumer_group_1 = require("./consumer-group");
const consumer_metadata_1 = require("./consumer-metadata");
const fetch_manager_1 = require("./fetch-manager");
const offset_manager_1 = require("./offset-manager");
const trace = (0, tracer_1.createTracer)('Consumer');
class Consumer extends events_1.default {
    cluster;
    options;
    metadata;
    consumerGroup;
    offsetManager;
    fetchManager;
    stopHook;
    constructor(cluster, options) {
        super();
        this.cluster = cluster;
        this.options = {
            ...options,
            groupId: options.groupId ?? null,
            groupInstanceId: options.groupInstanceId ?? null,
            rackId: options.rackId ?? '',
            sessionTimeoutMs: options.sessionTimeoutMs ?? 30_000,
            rebalanceTimeoutMs: options.rebalanceTimeoutMs ?? 60_000,
            maxWaitMs: options.maxWaitMs ?? 5000,
            minBytes: options.minBytes ?? 1,
            maxBytes: options.maxBytes ?? 1_048_576,
            partitionMaxBytes: options.partitionMaxBytes ?? 1_048_576,
            isolationLevel: options.isolationLevel ?? 1 /* IsolationLevel.READ_COMMITTED */,
            allowTopicAutoCreation: options.allowTopicAutoCreation ?? false,
            fromBeginning: options.fromBeginning ?? false,
            fromTimestamp: options.fromTimestamp ?? (options.fromBeginning ? -2n : -1n),
            retrier: options.retrier ?? retrier_1.defaultRetrier,
        };
        this.metadata = new consumer_metadata_1.ConsumerMetadata({ cluster: this.cluster });
        this.offsetManager = new offset_manager_1.OffsetManager({
            cluster: this.cluster,
            metadata: this.metadata,
            isolationLevel: this.options.isolationLevel,
        });
        this.consumerGroup = this.options.groupId
            ? new consumer_group_1.ConsumerGroup({
                cluster: this.cluster,
                topics: this.options.topics,
                groupId: this.options.groupId,
                groupInstanceId: this.options.groupInstanceId,
                sessionTimeoutMs: this.options.sessionTimeoutMs,
                rebalanceTimeoutMs: this.options.rebalanceTimeoutMs,
                metadata: this.metadata,
                offsetManager: this.offsetManager,
                consumer: this,
            })
            : undefined;
    }
    async start() {
        const { topics, allowTopicAutoCreation, fromTimestamp } = this.options;
        this.stopHook = undefined;
        try {
            await this.cluster.connect();
            await this.metadata.fetchMetadata({ topics, allowTopicAutoCreation });
            this.metadata.setAssignment(this.metadata.getTopicPartitions());
            await this.offsetManager.fetchOffsets({ fromTimestamp });
            await this.consumerGroup?.init();
        }
        catch (error) {
            logger_1.log.error('Failed to start consumer', error);
            logger_1.log.debug(`Restarting consumer in 1 second...`);
            await (0, delay_1.delay)(1000);
            if (this.stopHook)
                return this.stopHook();
            return this.close(true).then(() => this.start());
        }
        this.startFetchManager();
    }
    async close(force = false) {
        if (!force) {
            await new Promise(async (resolve) => {
                this.stopHook = resolve;
                await this.fetchManager?.stop();
            });
        }
        await this.consumerGroup?.leaveGroup().catch((error) => logger_1.log.debug(`Failed to leave group: ${error.message}`));
        await this.cluster.disconnect().catch((error) => logger_1.log.debug(`Failed to disconnect: ${error.message}`));
    }
    async startFetchManager() {
        const { groupId } = this.options;
        while (!this.stopHook) {
            try {
                await this.consumerGroup?.join();
                // TODO: If leader is not available, find another read replica
                const nodeAssignments = Object.entries((0, messages_to_topic_partition_leaders_1.distributeMessagesToTopicPartitionLeaders)(Object.entries(this.metadata.getAssignment()).flatMap(([topic, partitions]) => partitions.map((partition) => ({ topic, partition }))), this.metadata.getTopicPartitionLeaderIds())).map(([nodeId, assignment]) => ({
                    nodeId: parseInt(nodeId),
                    assignment: Object.fromEntries(Object.entries(assignment).map(([topic, partitions]) => [
                        topic,
                        Object.keys(partitions).map(Number),
                    ])),
                }));
                this.fetchManager = new fetch_manager_1.FetchManager({
                    fetch: this.fetch.bind(this),
                    process: this.process.bind(this),
                    nodeAssignments,
                });
                await this.fetchManager.start();
                if (!nodeAssignments.length) {
                    await this.waitForReassignment();
                }
            }
            catch (error) {
                await this.fetchManager?.stop();
                if (error.errorCode === api_1.API_ERROR.REBALANCE_IN_PROGRESS) {
                    logger_1.log.debug('Rebalance in progress...', { apiName: error.apiName, groupId });
                    continue;
                }
                if (error.errorCode === api_1.API_ERROR.FENCED_INSTANCE_ID) {
                    logger_1.log.debug('New consumer with the same groupInstanceId joined. Exiting the consumer...');
                    this.close();
                    break;
                }
                if (error instanceof error_1.ConnectionError ||
                    (error instanceof error_1.KafkaTSApiError && error.errorCode === api_1.API_ERROR.NOT_COORDINATOR)) {
                    logger_1.log.debug(`${error.message}. Restarting consumer...`);
                    this.close().then(() => this.start());
                    break;
                }
                logger_1.log.error(error.message, error);
                logger_1.log.debug(`Restarting consumer in 1 second...`);
                await (0, delay_1.delay)(1000);
                this.close().then(() => this.start());
                break;
            }
        }
        this.stopHook?.();
    }
    async waitForReassignment() {
        const { groupId } = this.options;
        logger_1.log.debug('No partitions assigned. Waiting for reassignment...', { groupId });
        while (!this.stopHook) {
            await (0, delay_1.delay)(1000);
            this.consumerGroup?.handleLastHeartbeat();
        }
    }
    async process(response) {
        const { options } = this;
        const { retrier } = options;
        this.consumerGroup?.handleLastHeartbeat();
        const topicPartitions = {};
        const messages = response.responses.flatMap(({ topicId, partitions }) => {
            const topic = this.metadata.getTopicNameById(topicId);
            topicPartitions[topic] ??= new Set();
            return partitions.flatMap(({ partitionIndex, records }) => {
                topicPartitions[topic].add(partitionIndex);
                return records.flatMap(({ baseTimestamp, baseOffset, records }) => records.flatMap((message) => ({
                    topic,
                    partition: partitionIndex,
                    key: message.key ?? null,
                    value: message.value ?? null,
                    headers: Object.fromEntries(message.headers.map(({ key, value }) => [key, value])),
                    timestamp: baseTimestamp + BigInt(message.timestampDelta),
                    offset: baseOffset + BigInt(message.offsetDelta),
                })));
            });
        });
        if (!messages.length) {
            return;
        }
        const resolveOffset = (message) => this.offsetManager.resolve(message.topic, message.partition, message.offset + 1n);
        try {
            await retrier(() => options.onBatch(messages.filter((message) => !this.offsetManager.isResolved(message)), { resolveOffset }));
        }
        catch (error) {
            await this.consumerGroup
                ?.offsetCommit(topicPartitions)
                .then(() => this.offsetManager.flush(topicPartitions))
                .catch();
            throw error;
        }
        response.responses.forEach(({ topicId, partitions }) => {
            partitions.forEach(({ partitionIndex, records }) => {
                records.forEach(({ baseOffset, lastOffsetDelta }) => {
                    this.offsetManager.resolve(this.metadata.getTopicNameById(topicId), partitionIndex, baseOffset + BigInt(lastOffsetDelta) + 1n);
                });
            });
        });
        await this.consumerGroup?.offsetCommit(topicPartitions);
        this.offsetManager.flush(topicPartitions);
    }
    fetch(nodeId, assignment) {
        const { rackId, maxWaitMs, minBytes, maxBytes, partitionMaxBytes, isolationLevel } = this.options;
        this.consumerGroup?.handleLastHeartbeat();
        return this.cluster.sendRequestToNode(nodeId)(api_1.API.FETCH, {
            maxWaitMs,
            minBytes,
            maxBytes,
            isolationLevel,
            sessionId: 0,
            sessionEpoch: -1,
            topics: Object.entries(assignment).map(([topic, partitions]) => ({
                topicId: this.metadata.getTopicIdByName(topic),
                partitions: partitions.map((partition) => ({
                    partition,
                    currentLeaderEpoch: -1,
                    fetchOffset: this.offsetManager.getCurrentOffset(topic, partition),
                    lastFetchedEpoch: -1,
                    logStartOffset: -1n,
                    partitionMaxBytes,
                })),
            })),
            forgottenTopicsData: [],
            rackId,
        });
    }
}
exports.Consumer = Consumer;
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Consumer.prototype, "start", null);
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Consumer.prototype, "close", null);
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Consumer.prototype, "process", null);
