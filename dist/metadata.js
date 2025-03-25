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
exports.Metadata = void 0;
const api_1 = require("./api");
const delay_1 = require("./utils/delay");
const error_1 = require("./utils/error");
const tracer_1 = require("./utils/tracer");
const trace = (0, tracer_1.createTracer)('Metadata');
class Metadata {
    options;
    topicPartitions = {};
    topicNameById = {};
    topicIdByName = {};
    leaderIdByTopicPartition = {};
    isrNodesByTopicPartition = {};
    constructor(options) {
        this.options = options;
    }
    getTopicPartitionLeaderIds() {
        return this.leaderIdByTopicPartition;
    }
    getTopicPartitionReplicaIds() {
        return this.isrNodesByTopicPartition;
    }
    getTopicPartitions() {
        return this.topicPartitions;
    }
    getTopicIdByName(name) {
        return this.topicIdByName[name];
    }
    getTopicNameById(id) {
        return this.topicNameById[id];
    }
    async fetchMetadataIfNecessary({ topics, allowTopicAutoCreation, }) {
        const missingTopics = Array.from(topics).filter((topic) => !this.topicPartitions[topic]);
        if (!missingTopics.length) {
            return;
        }
        try {
            return await this.fetchMetadata({ topics: missingTopics, allowTopicAutoCreation });
        }
        catch (error) {
            if (error instanceof error_1.KafkaTSApiError &&
                error.errorCode === api_1.API_ERROR.UNKNOWN_TOPIC_OR_PARTITION &&
                allowTopicAutoCreation) {
                // TODO: investigate if we can avoid the delay
                await (0, delay_1.delay)(1000);
                return await this.fetchMetadata({ topics: missingTopics, allowTopicAutoCreation });
            }
            throw error;
        }
    }
    async fetchMetadata({ topics, allowTopicAutoCreation, }) {
        const { cluster } = this.options;
        const response = await cluster.sendRequest(api_1.API.METADATA, {
            allowTopicAutoCreation,
            topics: topics ? Array.from(topics).map((name) => ({ id: null, name })) : null,
        });
        this.topicPartitions = {
            ...this.topicPartitions,
            ...Object.fromEntries(response.topics.map((topic) => [
                topic.name,
                topic.partitions.map((partition) => partition.partitionIndex),
            ])),
        };
        this.topicNameById = {
            ...this.topicNameById,
            ...Object.fromEntries(response.topics.map((topic) => [topic.topicId, topic.name])),
        };
        this.topicIdByName = {
            ...this.topicIdByName,
            ...Object.fromEntries(response.topics.map((topic) => [topic.name, topic.topicId])),
        };
        this.leaderIdByTopicPartition = {
            ...this.leaderIdByTopicPartition,
            ...Object.fromEntries(response.topics.map((topic) => [
                topic.name,
                Object.fromEntries(topic.partitions.map((partition) => [partition.partitionIndex, partition.leaderId])),
            ])),
        };
        this.isrNodesByTopicPartition = {
            ...this.isrNodesByTopicPartition,
            ...Object.fromEntries(response.topics.map((topic) => [
                topic.name,
                Object.fromEntries(topic.partitions.map((partition) => [partition.partitionIndex, partition.isrNodes])),
            ])),
        };
    }
}
exports.Metadata = Metadata;
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Metadata.prototype, "fetchMetadataIfNecessary", null);
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Metadata.prototype, "fetchMetadata", null);
