"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOIN_GROUP = void 0;
const api_1 = require("../utils/api");
const encoder_1 = require("../utils/encoder");
const error_1 = require("../utils/error");
exports.JOIN_GROUP = (0, api_1.createApi)({
    apiKey: 11,
    apiVersion: 9,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactString(data.groupId)
        .writeInt32(data.sessionTimeoutMs)
        .writeInt32(data.rebalanceTimeoutMs)
        .writeCompactString(data.memberId)
        .writeCompactString(data.groupInstanceId)
        .writeCompactString(data.protocolType)
        .writeCompactArray(data.protocols, (encoder, protocol) => {
        const metadata = new encoder_1.Encoder()
            .writeInt16(protocol.metadata.version)
            .writeArray(protocol.metadata.topics, (encoder, topic) => encoder.writeString(topic))
            .writeBytes(Buffer.alloc(0))
            .value();
        return encoder.writeCompactString(protocol.name).writeCompactBytes(metadata).writeUVarInt(0);
    })
        .writeCompactString(data.reason)
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            errorCode: decoder.readInt16(),
            generationId: decoder.readInt32(),
            protocolType: decoder.readCompactString(),
            protocolName: decoder.readCompactString(),
            leader: decoder.readCompactString(),
            skipAssignment: decoder.readBoolean(),
            memberId: decoder.readCompactString(),
            members: decoder.readCompactArray((decoder) => ({
                memberId: decoder.readCompactString(),
                groupInstanceId: decoder.readCompactString(),
                metadata: decoder.readCompactBytes(),
                _tag: decoder.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, null, result);
        return result;
    },
});
