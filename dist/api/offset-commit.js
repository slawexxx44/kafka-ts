"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFSET_COMMIT = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.OFFSET_COMMIT = (0, api_1.createApi)({
    apiKey: 8,
    apiVersion: 8,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactString(data.groupId)
        .writeInt32(data.generationIdOrMemberEpoch)
        .writeCompactString(data.memberId)
        .writeCompactString(data.groupInstanceId)
        .writeCompactArray(data.topics, (encoder, topic) => encoder
        .writeCompactString(topic.name)
        .writeCompactArray(topic.partitions, (encoder, partition) => encoder
        .writeInt32(partition.partitionIndex)
        .writeInt64(partition.committedOffset)
        .writeInt32(partition.committedLeaderEpoch)
        .writeCompactString(partition.committedMetadata)
        .writeUVarInt(0))
        .writeUVarInt(0))
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            topics: decoder.readCompactArray((decoder) => ({
                name: decoder.readCompactString(),
                partitions: decoder.readCompactArray((decoder) => ({
                    partitionIndex: decoder.readInt32(),
                    errorCode: decoder.readInt16(),
                    _tag: decoder.readTagBuffer(),
                })),
                _tag: decoder.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        result.topics.forEach((topic) => {
            topic.partitions.forEach((partition) => {
                if (partition.errorCode)
                    throw new error_1.KafkaTSApiError(partition.errorCode, null, result);
            });
        });
        return result;
    },
});
