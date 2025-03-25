"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYNC_GROUP = void 0;
const api_1 = require("../utils/api");
const decoder_1 = require("../utils/decoder");
const encoder_1 = require("../utils/encoder");
const error_1 = require("../utils/error");
exports.SYNC_GROUP = (0, api_1.createApi)({
    apiKey: 14,
    apiVersion: 5,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactString(data.groupId)
        .writeInt32(data.generationId)
        .writeCompactString(data.memberId)
        .writeCompactString(data.groupInstanceId)
        .writeCompactString(data.protocolType)
        .writeCompactString(data.protocolName)
        .writeCompactArray(data.assignments, (encoder, assignment) => encoder
        .writeCompactString(assignment.memberId)
        .writeCompactBytes(encodeAssignment(assignment.assignment))
        .writeUVarInt(0))
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            errorCode: decoder.readInt16(),
            protocolType: decoder.readCompactString(),
            protocolName: decoder.readCompactString(),
            assignments: decodeAssignment(decoder.readCompactBytes()),
            _tag2: decoder.readTagBuffer(),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, null, result);
        return result;
    },
});
const encodeAssignment = (data) => new encoder_1.Encoder()
    .writeInt16(0)
    .writeArray(Object.entries(data), (encoder, [topic, partitions]) => encoder.writeString(topic).writeArray(partitions, (encoder, partition) => encoder.writeInt32(partition)))
    .writeBytes(Buffer.alloc(0))
    .value();
const decodeAssignment = (data) => {
    const decoder = new decoder_1.Decoder(data);
    if (!decoder.getBufferLength()) {
        return {};
    }
    const result = {
        version: decoder.readInt16(),
        assignment: decoder.readArray((decoder) => ({
            topic: decoder.readString(),
            partitions: decoder.readArray((decoder) => decoder.readInt32()),
        })),
        userData: decoder.readBytes(),
    };
    return Object.fromEntries(result.assignment.map(({ topic, partitions }) => [topic, partitions]));
};
