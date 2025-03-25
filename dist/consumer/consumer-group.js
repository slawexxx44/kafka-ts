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
exports.ConsumerGroup = void 0;
const api_1 = require("../api");
const find_coordinator_1 = require("../api/find-coordinator");
const tracer_1 = require("../utils/tracer");
const trace = (0, tracer_1.createTracer)('ConsumerGroup');
class ConsumerGroup {
    options;
    coordinatorId = -1;
    memberId = '';
    generationId = -1;
    leaderId = '';
    memberIds = [];
    heartbeatInterval = null;
    heartbeatError = null;
    constructor(options) {
        this.options = options;
    }
    async init() {
        await this.findCoordinator();
        await this.options.cluster.setSeedBroker(this.coordinatorId);
        this.memberId = '';
    }
    async join() {
        await this.joinGroup();
        await this.syncGroup();
        await this.offsetFetch();
        this.startHeartbeater();
    }
    async startHeartbeater() {
        this.stopHeartbeater();
        this.heartbeatError = null;
        this.heartbeatInterval = setInterval(async () => {
            try {
                await this.heartbeat();
            }
            catch (error) {
                this.heartbeatError = error;
            }
        }, 5000);
    }
    async stopHeartbeater() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    handleLastHeartbeat() {
        if (this.heartbeatError) {
            throw this.heartbeatError;
        }
    }
    async findCoordinator() {
        const { coordinators } = await this.options.cluster.sendRequest(api_1.API.FIND_COORDINATOR, {
            keyType: find_coordinator_1.KEY_TYPE.GROUP,
            keys: [this.options.groupId],
        });
        this.coordinatorId = coordinators[0].nodeId;
    }
    async joinGroup() {
        const { cluster, groupId, groupInstanceId, sessionTimeoutMs, rebalanceTimeoutMs, topics } = this.options;
        try {
            const response = await cluster.sendRequest(api_1.API.JOIN_GROUP, {
                groupId,
                groupInstanceId,
                memberId: this.memberId,
                sessionTimeoutMs,
                rebalanceTimeoutMs,
                protocolType: 'consumer',
                protocols: [{ name: 'RoundRobinAssigner', metadata: { version: 0, topics } }],
                reason: null,
            });
            this.memberId = response.memberId;
            this.generationId = response.generationId;
            this.leaderId = response.leader;
            this.memberIds = response.members.map((member) => member.memberId);
        }
        catch (error) {
            if (error.errorCode === api_1.API_ERROR.MEMBER_ID_REQUIRED) {
                this.memberId = error.response.memberId;
                return this.joinGroup();
            }
            throw error;
        }
    }
    async syncGroup() {
        const { cluster, metadata, groupId, groupInstanceId } = this.options;
        let assignments = [];
        if (this.memberId === this.leaderId) {
            const memberAssignments = Object.entries(metadata.getTopicPartitions())
                .flatMap(([topic, partitions]) => partitions.map((partition) => ({ topic, partition })))
                .reduce((acc, { topic, partition }, index) => {
                const memberId = this.memberIds[index % this.memberIds.length];
                acc[memberId] ??= {};
                acc[memberId][topic] ??= [];
                acc[memberId][topic].push(partition);
                return acc;
            }, {});
            assignments = Object.entries(memberAssignments).map(([memberId, assignment]) => ({ memberId, assignment }));
        }
        const response = await cluster.sendRequest(api_1.API.SYNC_GROUP, {
            groupId,
            groupInstanceId,
            memberId: this.memberId,
            generationId: this.generationId,
            protocolType: 'consumer',
            protocolName: 'RoundRobinAssigner',
            assignments,
        });
        metadata.setAssignment(response.assignments);
    }
    async offsetFetch() {
        const { cluster, groupId, topics, metadata, offsetManager } = this.options;
        const assignment = metadata.getAssignment();
        const request = {
            groups: [
                {
                    groupId,
                    topics: topics
                        .map((topic) => ({ name: topic, partitionIndexes: assignment[topic] ?? [] }))
                        .filter(({ partitionIndexes }) => partitionIndexes.length),
                },
            ].filter(({ topics }) => topics.length),
            requireStable: true,
        };
        if (!request.groups.length)
            return;
        const response = await cluster.sendRequest(api_1.API.OFFSET_FETCH, request);
        const topicPartitions = {};
        response.groups.forEach((group) => {
            group.topics.forEach((topic) => {
                topicPartitions[topic.name] ??= new Set();
                topic.partitions.forEach(({ partitionIndex, committedOffset }) => {
                    if (committedOffset >= 0) {
                        topicPartitions[topic.name].add(partitionIndex);
                        offsetManager.resolve(topic.name, partitionIndex, committedOffset);
                    }
                });
            });
        });
        offsetManager.flush(topicPartitions);
    }
    async offsetCommit(topicPartitions) {
        const { cluster, groupId, groupInstanceId, offsetManager, consumer } = this.options;
        const request = {
            groupId,
            groupInstanceId,
            memberId: this.memberId,
            generationIdOrMemberEpoch: this.generationId,
            topics: Object.entries(topicPartitions)
                .filter(([topic]) => topic in offsetManager.pendingOffsets)
                .map(([topic, partitions]) => ({
                name: topic,
                partitions: [...partitions]
                    .filter((partition) => partition in offsetManager.pendingOffsets[topic])
                    .map((partitionIndex) => ({
                    partitionIndex,
                    committedOffset: offsetManager.pendingOffsets[topic][partitionIndex],
                    committedLeaderEpoch: -1,
                    committedMetadata: null,
                })),
            })),
        };
        if (!request.topics.length) {
            return;
        }
        await cluster.sendRequest(api_1.API.OFFSET_COMMIT, request);
        consumer.emit('offsetCommit');
    }
    async heartbeat() {
        const { cluster, groupId, groupInstanceId, consumer } = this.options;
        await cluster.sendRequest(api_1.API.HEARTBEAT, {
            groupId,
            groupInstanceId,
            memberId: this.memberId,
            generationId: this.generationId,
        });
        consumer.emit('heartbeat');
    }
    async leaveGroup() {
        if (this.coordinatorId === -1) {
            return;
        }
        const { cluster, groupId, groupInstanceId } = this.options;
        this.stopHeartbeater();
        try {
            await cluster.sendRequest(api_1.API.LEAVE_GROUP, {
                groupId,
                members: [{ memberId: this.memberId, groupInstanceId, reason: null }],
            });
        }
        catch (error) {
            if (error.errorCode === api_1.API_ERROR.FENCED_INSTANCE_ID) {
                return;
            }
            throw error;
        }
    }
}
exports.ConsumerGroup = ConsumerGroup;
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumerGroup.prototype, "init", null);
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumerGroup.prototype, "join", null);
