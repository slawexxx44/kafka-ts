/// <reference types="node" />
import { Api } from '../utils/api';
export declare const API: {
    API_VERSIONS: Api<unknown, {
        errorCode: number;
        versions: {
            apiKey: number;
            minVersion: number;
            maxVersion: number;
        }[];
        throttleTimeMs: number;
    }>;
    CREATE_TOPICS: Api<{
        topics: {
            name: string;
            numPartitions?: number | undefined;
            replicationFactor?: number | undefined;
            assignments?: {
                partitionIndex: number;
                brokerIds: number[];
            }[] | undefined;
            configs?: {
                name: string;
                value: string | null;
            }[] | undefined;
        }[];
        timeoutMs?: number | undefined;
        validateOnly?: boolean | undefined;
    }, {
        _tag: void;
        throttleTimeMs: number;
        topics: {
            name: string | null;
            topicId: string;
            errorCode: number;
            errorMessage: string | null;
            numPartitions: number;
            replicationFactor: number;
            configs: {
                name: string | null;
                value: string | null;
                readOnly: boolean;
                configSource: number;
                isSensitive: boolean;
                _tag: void;
            }[];
            _tag: void;
        }[];
        _tag2: void;
    }>;
    DELETE_TOPICS: Api<{
        topics: {
            name: string | null;
            topicId: string | null;
        }[];
        timeoutMs?: number | undefined;
    }, {
        _tag: void;
        throttleTimeMs: number;
        responses: {
            name: string | null;
            topicId: string;
            errorCode: number;
            errorMessage: string | null;
            _tag: void;
        }[];
        _tag2: void;
    }>;
    FETCH: Api<{
        maxWaitMs: number;
        minBytes: number;
        maxBytes: number;
        isolationLevel: import("./fetch").IsolationLevel;
        sessionId: number;
        sessionEpoch: number;
        topics: {
            topicId: string;
            partitions: {
                partition: number;
                currentLeaderEpoch: number;
                fetchOffset: bigint;
                lastFetchedEpoch: number;
                logStartOffset: bigint;
                partitionMaxBytes: number;
            }[];
        }[];
        forgottenTopicsData: {
            topicId: string;
            partitions: number[];
        }[];
        rackId: string;
    }, {
        _tag: void;
        throttleTimeMs: number;
        errorCode: number;
        sessionId: number;
        responses: {
            topicId: string;
            partitions: {
                partitionIndex: number;
                errorCode: number;
                highWatermark: bigint;
                lastStableOffset: bigint;
                logStartOffset: bigint;
                abortedTransactions: {
                    producerId: bigint;
                    firstOffset: bigint;
                    _tag: void;
                }[];
                preferredReadReplica: number;
                records: {
                    baseOffset: bigint;
                    batchLength: number;
                    partitionLeaderEpoch: number;
                    magic: number;
                    crc: number;
                    attributes: number;
                    compression: number;
                    timestampType: string;
                    isTransactional: boolean;
                    isControlBatch: boolean;
                    hasDeleteHorizonMs: boolean;
                    lastOffsetDelta: number;
                    baseTimestamp: bigint;
                    maxTimestamp: bigint;
                    producerId: bigint;
                    producerEpoch: number;
                    baseSequence: number;
                    records: {
                        attributes: number;
                        timestampDelta: bigint;
                        offsetDelta: number;
                        key: string | null;
                        value: string | null;
                        headers: {
                            key: string;
                            value: string;
                        }[];
                    }[];
                }[];
                _tag: void;
            }[];
            _tag: void;
        }[];
        _tag2: void;
    }>;
    FIND_COORDINATOR: Api<{
        keyType: number;
        keys: string[];
    }, {
        _tag: void;
        throttleTimeMs: number;
        coordinators: {
            key: string | null;
            nodeId: number;
            host: string;
            port: number;
            errorCode: number;
            errorMessage: string | null;
            _tag: void;
        }[];
        _tag2: void;
    }>;
    HEARTBEAT: Api<{
        groupId: string;
        generationId: number;
        memberId: string;
        groupInstanceId: string | null;
    }, {
        _tag: void;
        throttleTimeMs: number;
        errorCode: number;
        _tag2: void;
    }>;
    INIT_PRODUCER_ID: Api<{
        transactionalId: string | null;
        transactionTimeoutMs: number;
        producerId: bigint;
        producerEpoch: number;
    }, {
        _tag: void;
        throttleTimeMs: number;
        errorCode: number;
        producerId: bigint;
        producerEpoch: number;
        _tag2: void;
    }>;
    JOIN_GROUP: Api<{
        groupId: string;
        sessionTimeoutMs: number;
        rebalanceTimeoutMs: number;
        memberId: string;
        groupInstanceId: string | null;
        protocolType: string;
        protocols: {
            name: string;
            metadata: {
                version: number;
                topics: string[];
            };
        }[];
        reason: string | null;
    }, {
        _tag: void;
        throttleTimeMs: number;
        errorCode: number;
        generationId: number;
        protocolType: string | null;
        protocolName: string | null;
        leader: string;
        skipAssignment: boolean;
        memberId: string;
        members: {
            memberId: string;
            groupInstanceId: string | null;
            metadata: Buffer;
            _tag: void;
        }[];
        _tag2: void;
    }>;
    LEAVE_GROUP: Api<{
        groupId: string;
        members: {
            memberId: string;
            groupInstanceId: string | null;
            reason: string | null;
        }[];
    }, {
        _tag: void;
        throttleTimeMs: number;
        errorCode: number;
        members: {
            memberId: string;
            groupInstanceId: string | null;
            errorCode: number;
            _tag: void;
        }[];
        _tag2: void;
    }>;
    LIST_OFFSETS: Api<{
        replicaId: number;
        isolationLevel: import("./fetch").IsolationLevel;
        topics: {
            name: string;
            partitions: {
                partitionIndex: number;
                currentLeaderEpoch: number;
                timestamp: bigint;
            }[];
        }[];
    }, {
        _tag: void;
        throttleTimeMs: number;
        topics: {
            name: string;
            partitions: {
                partitionIndex: number;
                errorCode: number;
                timestamp: bigint;
                offset: bigint;
                leaderEpoch: number;
                _tag: void;
            }[];
            _tag: void;
        }[];
        _tag2: void;
    }>;
    METADATA: Api<{
        topics?: {
            id: string | null;
            name: string;
        }[] | null | undefined;
        allowTopicAutoCreation?: boolean | undefined;
        includeTopicAuthorizedOperations?: boolean | undefined;
    }, {
        _tag: void;
        throttleTimeMs: number;
        brokers: {
            nodeId: number;
            host: string;
            port: number;
            rack: string | null;
            _tag: void;
        }[];
        clusterId: string | null;
        controllerId: number;
        topics: {
            errorCode: number;
            name: string;
            topicId: string;
            isInternal: boolean;
            partitions: {
                errorCode: number;
                partitionIndex: number;
                leaderId: number;
                leaderEpoch: number;
                replicaNodes: number[];
                isrNodes: number[];
                offlineReplicas: number[];
                _tag: void;
            }[];
            topicAuthorizedOperations: number;
            _tag: void;
        }[];
        _tag2: void;
    }>;
    OFFSET_COMMIT: Api<{
        groupId: string;
        generationIdOrMemberEpoch: number;
        memberId: string;
        groupInstanceId: string | null;
        topics: {
            name: string;
            partitions: {
                partitionIndex: number;
                committedOffset: bigint;
                committedLeaderEpoch: number;
                committedMetadata: string | null;
            }[];
        }[];
    }, {
        _tag: void;
        throttleTimeMs: number;
        topics: {
            name: string | null;
            partitions: {
                partitionIndex: number;
                errorCode: number;
                _tag: void;
            }[];
            _tag: void;
        }[];
        _tag2: void;
    }>;
    OFFSET_FETCH: Api<{
        groups: {
            groupId: string;
            topics: {
                name: string;
                partitionIndexes: number[];
            }[];
        }[];
        requireStable: boolean;
    }, {
        _tag: void;
        throttleTimeMs: number;
        groups: {
            groupId: string | null;
            topics: {
                name: string;
                partitions: {
                    partitionIndex: number;
                    committedOffset: bigint;
                    committedLeaderEpoch: number;
                    committedMetadata: string | null;
                    errorCode: number;
                    _tag: void;
                }[];
                _tag: void;
            }[];
            errorCode: number;
            _tag: void;
        }[];
        _tag2: void;
    }>;
    PRODUCE: Api<{
        transactionalId: string | null;
        acks: number;
        timeoutMs: number;
        topicData: {
            name: string;
            partitionData: {
                index: number;
                baseOffset: bigint;
                partitionLeaderEpoch: number;
                attributes: number;
                lastOffsetDelta: number;
                baseTimestamp: bigint;
                maxTimestamp: bigint;
                producerId: bigint;
                producerEpoch: number;
                baseSequence: number;
                records: {
                    attributes: number;
                    timestampDelta: bigint;
                    offsetDelta: number;
                    key: string | null;
                    value: string | null;
                    headers: {
                        key: string;
                        value: string;
                    }[];
                }[];
            }[];
        }[];
    }, {
        _tag: void;
        responses: {
            name: string | null;
            partitionResponses: {
                index: number;
                errorCode: number;
                baseOffset: bigint;
                logAppendTime: bigint;
                logStartOffset: bigint;
                recordErrors: {
                    batchIndex: number;
                    batchIndexError: number;
                    _tag: void;
                }[];
                errorMessage: string | null;
                _tag: void;
            }[];
            _tag: void;
        }[];
        throttleTimeMs: number;
        _tag2: void;
    }>;
    SASL_AUTHENTICATE: Api<{
        authBytes: Buffer;
    }, {
        _tag: void;
        errorCode: number;
        errorMessage: string | null;
        authBytes: Buffer | null;
        sessionLifetimeMs: bigint;
        _tag2: void;
    }>;
    SASL_HANDSHAKE: Api<{
        mechanism: string;
    }, {
        errorCode: number;
        mechanisms: (string | null)[];
    }>;
    SYNC_GROUP: Api<{
        groupId: string;
        generationId: number;
        memberId: string;
        groupInstanceId: string | null;
        protocolType: string | null;
        protocolName: string | null;
        assignments: import("./sync-group").MemberAssignment[];
    }, {
        _tag: void;
        throttleTimeMs: number;
        errorCode: number;
        protocolType: string | null;
        protocolName: string | null;
        assignments: import("./sync-group").Assignment;
        _tag2: void;
    }>;
};
export declare const getApiName: <Request, Response>(api: Api<Request, Response>) => string;
export declare const API_ERROR: {
    UNKNOWN_SERVER_ERROR: number;
    OFFSET_OUT_OF_RANGE: number;
    CORRUPT_MESSAGE: number;
    UNKNOWN_TOPIC_OR_PARTITION: number;
    INVALID_FETCH_SIZE: number;
    LEADER_NOT_AVAILABLE: number;
    NOT_LEADER_OR_FOLLOWER: number;
    REQUEST_TIMED_OUT: number;
    BROKER_NOT_AVAILABLE: number;
    REPLICA_NOT_AVAILABLE: number;
    MESSAGE_TOO_LARGE: number;
    STALE_CONTROLLER_EPOCH: number;
    OFFSET_METADATA_TOO_LARGE: number;
    NETWORK_EXCEPTION: number;
    COORDINATOR_LOAD_IN_PROGRESS: number;
    COORDINATOR_NOT_AVAILABLE: number;
    NOT_COORDINATOR: number;
    INVALID_TOPIC_EXCEPTION: number;
    RECORD_LIST_TOO_LARGE: number;
    NOT_ENOUGH_REPLICAS: number;
    NOT_ENOUGH_REPLICAS_AFTER_APPEND: number;
    INVALID_REQUIRED_ACKS: number;
    ILLEGAL_GENERATION: number;
    INCONSISTENT_GROUP_PROTOCOL: number;
    INVALID_GROUP_ID: number;
    UNKNOWN_MEMBER_ID: number;
    INVALID_SESSION_TIMEOUT: number;
    REBALANCE_IN_PROGRESS: number;
    INVALID_COMMIT_OFFSET_SIZE: number;
    TOPIC_AUTHORIZATION_FAILED: number;
    GROUP_AUTHORIZATION_FAILED: number;
    CLUSTER_AUTHORIZATION_FAILED: number;
    INVALID_TIMESTAMP: number;
    UNSUPPORTED_SASL_MECHANISM: number;
    ILLEGAL_SASL_STATE: number;
    UNSUPPORTED_VERSION: number;
    TOPIC_ALREADY_EXISTS: number;
    INVALID_PARTITIONS: number;
    INVALID_REPLICATION_FACTOR: number;
    INVALID_REPLICA_ASSIGNMENT: number;
    INVALID_CONFIG: number;
    NOT_CONTROLLER: number;
    INVALID_REQUEST: number;
    UNSUPPORTED_FOR_MESSAGE_FORMAT: number;
    POLICY_VIOLATION: number;
    OUT_OF_ORDER_SEQUENCE_NUMBER: number;
    DUPLICATE_SEQUENCE_NUMBER: number;
    INVALID_PRODUCER_EPOCH: number;
    INVALID_TXN_STATE: number;
    INVALID_PRODUCER_ID_MAPPING: number;
    INVALID_TRANSACTION_TIMEOUT: number;
    CONCURRENT_TRANSACTIONS: number;
    TRANSACTION_COORDINATOR_FENCED: number;
    TRANSACTIONAL_ID_AUTHORIZATION_FAILED: number;
    SECURITY_DISABLED: number;
    OPERATION_NOT_ATTEMPTED: number;
    KAFKA_STORAGE_ERROR: number;
    LOG_DIR_NOT_FOUND: number;
    SASL_AUTHENTICATION_FAILED: number;
    UNKNOWN_PRODUCER_ID: number;
    REASSIGNMENT_IN_PROGRESS: number;
    DELEGATION_TOKEN_AUTH_DISABLED: number;
    DELEGATION_TOKEN_NOT_FOUND: number;
    DELEGATION_TOKEN_OWNER_MISMATCH: number;
    DELEGATION_TOKEN_REQUEST_NOT_ALLOWED: number;
    DELEGATION_TOKEN_AUTHORIZATION_FAILED: number;
    DELEGATION_TOKEN_EXPIRED: number;
    INVALID_PRINCIPAL_TYPE: number;
    NON_EMPTY_GROUP: number;
    GROUP_ID_NOT_FOUND: number;
    FETCH_SESSION_ID_NOT_FOUND: number;
    INVALID_FETCH_SESSION_EPOCH: number;
    LISTENER_NOT_FOUND: number;
    TOPIC_DELETION_DISABLED: number;
    FENCED_LEADER_EPOCH: number;
    UNKNOWN_LEADER_EPOCH: number;
    UNSUPPORTED_COMPRESSION_TYPE: number;
    STALE_BROKER_EPOCH: number;
    OFFSET_NOT_AVAILABLE: number;
    MEMBER_ID_REQUIRED: number;
    PREFERRED_LEADER_NOT_AVAILABLE: number;
    GROUP_MAX_SIZE_REACHED: number;
    FENCED_INSTANCE_ID: number;
    ELIGIBLE_LEADERS_NOT_AVAILABLE: number;
    ELECTION_NOT_NEEDED: number;
    NO_REASSIGNMENT_IN_PROGRESS: number;
    GROUP_SUBSCRIBED_TO_TOPIC: number;
    INVALID_RECORD: number;
    UNSTABLE_OFFSET_COMMIT: number;
    THROTTLING_QUOTA_EXCEEDED: number;
    PRODUCER_FENCED: number;
    RESOURCE_NOT_FOUND: number;
    DUPLICATE_RESOURCE: number;
    UNACCEPTABLE_CREDENTIAL: number;
    INCONSISTENT_VOTER_SET: number;
    INVALID_UPDATE_VERSION: number;
    FEATURE_UPDATE_FAILED: number;
    PRINCIPAL_DESERIALIZATION_FAILURE: number;
    SNAPSHOT_NOT_FOUND: number;
    POSITION_OUT_OF_RANGE: number;
    UNKNOWN_TOPIC_ID: number;
    DUPLICATE_BROKER_REGISTRATION: number;
    BROKER_ID_NOT_REGISTERED: number;
    INCONSISTENT_TOPIC_ID: number;
    INCONSISTENT_CLUSTER_ID: number;
    TRANSACTIONAL_ID_NOT_FOUND: number;
    FETCH_SESSION_TOPIC_ID_ERROR: number;
    INELIGIBLE_REPLICA: number;
    NEW_LEADER_ELECTED: number;
    OFFSET_MOVED_TO_TIERED_STORAGE: number;
    FENCED_MEMBER_EPOCH: number;
    UNRELEASED_INSTANCE_ID: number;
    UNSUPPORTED_ASSIGNOR: number;
    STALE_MEMBER_EPOCH: number;
    MISMATCHED_ENDPOINT_TYPE: number;
    UNSUPPORTED_ENDPOINT_TYPE: number;
    UNKNOWN_CONTROLLER_ID: number;
    UNKNOWN_SUBSCRIPTION_ID: number;
    TELEMETRY_TOO_LARGE: number;
    INVALID_REGISTRATION: number;
    TRANSACTION_ABORTABLE: number;
};
