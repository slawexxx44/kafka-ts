"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_TOPICS = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.CREATE_TOPICS = (0, api_1.createApi)({
    apiKey: 19,
    apiVersion: 7,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactArray(data.topics, (encoder, topic) => encoder
        .writeCompactString(topic.name)
        .writeInt32(topic.numPartitions ?? -1)
        .writeInt16(topic.replicationFactor ?? -1)
        .writeCompactArray(topic.assignments ?? [], (encoder, assignment) => encoder
        .writeInt32(assignment.partitionIndex)
        .writeCompactArray(assignment.brokerIds, (encoder, brokerId) => encoder.writeInt32(brokerId))
        .writeUVarInt(0))
        .writeCompactArray(topic.configs ?? [], (encoder, config) => encoder.writeCompactString(config.name).writeCompactString(config.value).writeUVarInt(0))
        .writeUVarInt(0))
        .writeInt32(data.timeoutMs ?? 10_000)
        .writeBoolean(data.validateOnly ?? false)
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            topics: decoder.readCompactArray((topic) => ({
                name: topic.readCompactString(),
                topicId: topic.readUUID(),
                errorCode: topic.readInt16(),
                errorMessage: topic.readCompactString(),
                numPartitions: topic.readInt32(),
                replicationFactor: topic.readInt16(),
                configs: topic.readCompactArray((config) => ({
                    name: config.readCompactString(),
                    value: config.readCompactString(),
                    readOnly: config.readBoolean(),
                    configSource: config.readInt8(),
                    isSensitive: config.readBoolean(),
                    _tag: config.readTagBuffer(),
                })),
                _tag: topic.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        result.topics.forEach((topic) => {
            if (topic.errorCode)
                throw new error_1.KafkaTSApiError(topic.errorCode, topic.errorMessage, result);
        });
        return result;
    },
});
