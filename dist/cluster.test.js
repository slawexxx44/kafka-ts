"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const vitest_1 = require("vitest");
const api_1 = require("./api");
const find_coordinator_1 = require("./api/find-coordinator");
const auth_1 = require("./auth");
const client_1 = require("./client");
const kafka = (0, client_1.createKafkaClient)({
    clientId: 'kafka-ts',
    bootstrapServers: [{ host: 'localhost', port: 9092 }],
    sasl: (0, auth_1.saslPlain)({ username: 'admin', password: 'admin' }),
    ssl: { ca: (0, fs_1.readFileSync)('./certs/ca.crt').toString() },
});
vitest_1.describe.sequential('Low-level API', () => {
    const groupId = (0, crypto_1.randomBytes)(16).toString('hex');
    let cluster;
    (0, vitest_1.beforeAll)(async () => {
        cluster = await kafka.createCluster();
        await cluster.connect();
        const metadataResult = await cluster.sendRequest(api_1.API.METADATA, {
            topics: null,
            allowTopicAutoCreation: false,
            includeTopicAuthorizedOperations: false,
        });
        if (metadataResult.topics.some((topic) => topic.name === 'kafka-ts-test-topic')) {
            await cluster.sendRequest(api_1.API.DELETE_TOPICS, {
                topics: [{ name: 'kafka-ts-test-topic', topicId: null }],
                timeoutMs: 10000,
            });
        }
    });
    (0, vitest_1.afterAll)(async () => {
        await cluster.disconnect();
    });
    (0, vitest_1.it)('should request api versions', async () => {
        const result = await cluster.sendRequest(api_1.API.API_VERSIONS, {});
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    let topicId = 'd6718d178e1b47c886441ad2d19faea5';
    (0, vitest_1.it)('should create topics', async () => {
        const result = await cluster.sendRequest(api_1.API.CREATE_TOPICS, {
            topics: [
                {
                    name: 'kafka-ts-test-topic',
                    numPartitions: 10,
                    replicationFactor: 3,
                    assignments: [],
                    configs: [],
                },
            ],
            timeoutMs: 10000,
            validateOnly: false,
        });
        topicId = result.topics[0].topicId;
        result.topics.forEach((topic) => {
            topic.topicId = 'Any<UUID>';
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    (0, vitest_1.it)('should request metadata for all topics', async () => {
        const result = await cluster.sendRequest(api_1.API.METADATA, {
            topics: null,
            allowTopicAutoCreation: false,
            includeTopicAuthorizedOperations: false,
        });
        result.controllerId = 0;
        result.topics = result.topics.filter((topic) => topic.name !== '__consumer_offsets');
        result.topics.forEach((topic) => {
            topic.topicId = 'Any<UUID>';
            topic.partitions.forEach((partition) => {
                partition.leaderId = 0;
                partition.isrNodes = [0];
                partition.replicaNodes = [0];
            });
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    let partitionIndex = 0;
    let leaderId = 0;
    (0, vitest_1.it)('should request metadata for a topic', async () => {
        const result = await cluster.sendRequest(api_1.API.METADATA, {
            topics: [{ id: topicId, name: 'kafka-ts-test-topic' }],
            allowTopicAutoCreation: false,
            includeTopicAuthorizedOperations: false,
        });
        partitionIndex = result.topics[0].partitions[0].partitionIndex;
        leaderId = result.topics[0].partitions[0].leaderId;
        result.controllerId = 0;
        result.topics.forEach((topic) => {
            topic.topicId = 'Any<UUID>';
            topic.partitions.forEach((partition) => {
                partition.leaderId = 0;
                partition.isrNodes = [0];
                partition.replicaNodes = [0];
            });
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    let producerId = 9n;
    (0, vitest_1.it)('should init producer id', async () => {
        const result = await cluster.sendRequest(api_1.API.INIT_PRODUCER_ID, {
            transactionalId: null,
            transactionTimeoutMs: 0,
            producerId,
            producerEpoch: 0,
        });
        result.producerId = 0n;
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should produce messages', async () => {
        const now = Date.now();
        const result = await cluster.sendRequestToNode(leaderId)(api_1.API.PRODUCE, {
            transactionalId: null,
            timeoutMs: 10000,
            acks: 1,
            topicData: [
                {
                    name: 'kafka-ts-test-topic',
                    partitionData: [
                        {
                            index: partitionIndex,
                            baseOffset: 0n,
                            partitionLeaderEpoch: 0,
                            attributes: 0,
                            baseSequence: 0,
                            baseTimestamp: BigInt(now),
                            lastOffsetDelta: 0,
                            maxTimestamp: BigInt(now),
                            producerEpoch: 0,
                            producerId,
                            records: [
                                {
                                    attributes: 0,
                                    offsetDelta: 0,
                                    timestampDelta: 0n,
                                    key: 'key',
                                    value: 'value',
                                    headers: [
                                        {
                                            key: 'header-key',
                                            value: 'header-value',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should fetch messages', async () => {
        const result = await cluster.sendRequestToNode(leaderId)(api_1.API.FETCH, {
            maxWaitMs: 100,
            minBytes: 1,
            maxBytes: 10485760,
            isolationLevel: 1,
            sessionId: 0,
            sessionEpoch: -1,
            topics: [
                {
                    topicId,
                    partitions: [
                        {
                            partition: partitionIndex,
                            currentLeaderEpoch: -1,
                            fetchOffset: 0n,
                            lastFetchedEpoch: 0,
                            logStartOffset: -1n,
                            partitionMaxBytes: 10485760,
                        },
                    ],
                },
            ],
            forgottenTopicsData: [],
            rackId: '',
        });
        result.responses.forEach((response) => {
            response.topicId = 'Any<UUID>';
            response.partitions.forEach((partition) => {
                partition.records.forEach((record) => {
                    (0, vitest_1.expect)(record.baseTimestamp).toBeGreaterThan(1721926744730n);
                    (0, vitest_1.expect)(record.maxTimestamp).toBeGreaterThan(1721926744730n);
                    (0, vitest_1.expect)(record.crc).toBeGreaterThan(0);
                    record.baseTimestamp = 0n;
                    record.maxTimestamp = 0n;
                    record.crc = 0;
                });
            });
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    let coordinatorId = -1;
    (0, vitest_1.it)('should find coordinator', async () => {
        const result = await cluster.sendRequest(api_1.API.FIND_COORDINATOR, { keyType: find_coordinator_1.KEY_TYPE.GROUP, keys: [groupId] });
        result.coordinators.forEach((coordinator) => {
            coordinator.key = 'Any<String>';
        });
        coordinatorId = result.coordinators[0].nodeId;
        result.coordinators.forEach((coordinator) => {
            coordinator.nodeId = 1;
            coordinator.port = 9093;
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    let memberId = '';
    (0, vitest_1.it)('should fail join group request with new memberId', async () => {
        try {
            const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.JOIN_GROUP, {
                groupId,
                sessionTimeoutMs: 30000,
                rebalanceTimeoutMs: 60000,
                memberId,
                groupInstanceId: null,
                protocolType: 'consumer',
                protocols: [
                    {
                        name: 'RoundRobinAssigner',
                        metadata: { version: 0, topics: ['kafka-ts-test-topic'] },
                    },
                ],
                reason: null,
            });
            (0, vitest_1.expect)(false, 'Should throw an error').toBe(true);
        }
        catch (error) {
            const { response } = error;
            memberId = response.memberId;
            response.memberId = 'Any<UUID>';
            (0, vitest_1.expect)(response).toMatchSnapshot();
        }
    });
    (0, vitest_1.it)('should join group', async () => {
        const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.JOIN_GROUP, {
            groupId,
            sessionTimeoutMs: 30000,
            rebalanceTimeoutMs: 60000,
            memberId,
            groupInstanceId: null,
            protocolType: 'consumer',
            protocols: [
                {
                    name: 'RoundRobinAssigner',
                    metadata: { version: 0, topics: ['kafka-ts-test-topic'] },
                },
            ],
            reason: null,
        });
        result.memberId = 'Any<UUID>';
        result.leader = 'Any<UUID>';
        result.members.forEach((member) => {
            member.memberId = 'Any<UUID>';
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should sync group', async () => {
        const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.SYNC_GROUP, {
            groupId,
            generationId: 1,
            memberId,
            groupInstanceId: null,
            protocolType: 'consumer',
            protocolName: 'RoundRobinAssigner',
            assignments: [
                {
                    memberId,
                    assignment: { 'kafka-test-topic': [0] },
                },
            ],
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should commit offsets', async () => {
        const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.OFFSET_COMMIT, {
            groupId,
            generationIdOrMemberEpoch: 1,
            memberId,
            groupInstanceId: null,
            topics: [
                {
                    name: 'kafka-ts-test-topic',
                    partitions: [
                        { partitionIndex: 0, committedOffset: 1n, committedLeaderEpoch: 0, committedMetadata: null },
                    ],
                },
            ],
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should fetch offsets', async () => {
        const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.OFFSET_FETCH, {
            groups: [
                {
                    groupId,
                    topics: [
                        {
                            name: 'kafka-ts-test-topic',
                            partitionIndexes: [0],
                        },
                    ],
                },
            ],
            requireStable: false,
        });
        result.groups.forEach((group) => {
            group.groupId = 'Any<String>';
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should heartbeat', async () => {
        const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.HEARTBEAT, {
            groupId,
            generationId: 1,
            memberId,
            groupInstanceId: null,
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should leave group', async () => {
        const result = await cluster.sendRequestToNode(coordinatorId)(api_1.API.LEAVE_GROUP, {
            groupId,
            members: [{ memberId, groupInstanceId: null, reason: null }],
        });
        result.members.forEach((member) => {
            member.memberId = 'Any<UUID>';
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
    (0, vitest_1.it)('should delete topics', async () => {
        const result = await cluster.sendRequest(api_1.API.DELETE_TOPICS, {
            topics: [{ name: 'kafka-ts-test-topic', topicId: null }],
            timeoutMs: 10000,
        });
        result.responses.forEach((response) => {
            response.topicId = 'Any<UUID>';
        });
        (0, vitest_1.expect)(result).toMatchSnapshot();
    });
});
