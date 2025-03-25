"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE_TOPICS = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.DELETE_TOPICS = (0, api_1.createApi)({
    apiKey: 20,
    apiVersion: 6,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactArray(data.topics, (encoder, topic) => encoder.writeCompactString(topic.name).writeUUID(topic.topicId).writeUVarInt(0))
        .writeInt32(data.timeoutMs ?? 10_000)
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            responses: decoder.readCompactArray((decoder) => ({
                name: decoder.readCompactString(),
                topicId: decoder.readUUID(),
                errorCode: decoder.readInt16(),
                errorMessage: decoder.readCompactString(),
                _tag: decoder.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        result.responses.forEach((response) => {
            if (response.errorCode)
                throw new error_1.KafkaTSApiError(response.errorCode, response.errorMessage, result);
        });
        return result;
    },
});
