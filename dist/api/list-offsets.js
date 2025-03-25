"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIST_OFFSETS = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.LIST_OFFSETS = (0, api_1.createApi)({
    apiKey: 2,
    apiVersion: 8,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeInt32(data.replicaId)
        .writeInt8(data.isolationLevel)
        .writeCompactArray(data.topics, (encoder, topic) => encoder
        .writeCompactString(topic.name)
        .writeCompactArray(topic.partitions, (encoder, partition) => encoder
        .writeInt32(partition.partitionIndex)
        .writeInt32(partition.currentLeaderEpoch)
        .writeInt64(partition.timestamp)
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
                    timestamp: decoder.readInt64(),
                    offset: decoder.readInt64(),
                    leaderEpoch: decoder.readInt32(),
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
