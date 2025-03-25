"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METADATA = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.METADATA = (0, api_1.createApi)({
    apiKey: 3,
    apiVersion: 12,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactArray(data.topics ?? null, (encoder, topic) => encoder.writeUUID(topic.id).writeCompactString(topic.name).writeUVarInt(0))
        .writeBoolean(data.allowTopicAutoCreation ?? false)
        .writeBoolean(data.includeTopicAuthorizedOperations ?? false)
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            brokers: decoder.readCompactArray((broker) => ({
                nodeId: broker.readInt32(),
                host: broker.readCompactString(),
                port: broker.readInt32(),
                rack: broker.readCompactString(),
                _tag: broker.readTagBuffer(),
            })),
            clusterId: decoder.readCompactString(),
            controllerId: decoder.readInt32(),
            topics: decoder.readCompactArray((topic) => ({
                errorCode: topic.readInt16(),
                name: topic.readCompactString(),
                topicId: topic.readUUID(),
                isInternal: topic.readBoolean(),
                partitions: topic.readCompactArray((partition) => ({
                    errorCode: partition.readInt16(),
                    partitionIndex: partition.readInt32(),
                    leaderId: partition.readInt32(),
                    leaderEpoch: partition.readInt32(),
                    replicaNodes: partition.readCompactArray((node) => node.readInt32()),
                    isrNodes: partition.readCompactArray((node) => node.readInt32()),
                    offlineReplicas: partition.readCompactArray((node) => node.readInt32()),
                    _tag: partition.readTagBuffer(),
                })),
                topicAuthorizedOperations: topic.readInt32(),
                _tag: topic.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        result.topics.forEach((topic) => {
            if (topic.errorCode)
                throw new error_1.KafkaTSApiError(topic.errorCode, null, result);
            topic.partitions.forEach((partition) => {
                if (partition.errorCode)
                    throw new error_1.KafkaTSApiError(partition.errorCode, null, result);
            });
        });
        return result;
    },
});
