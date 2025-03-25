"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEARTBEAT = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.HEARTBEAT = (0, api_1.createApi)({
    apiKey: 12,
    apiVersion: 4,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeCompactString(data.groupId)
        .writeInt32(data.generationId)
        .writeCompactString(data.memberId)
        .writeCompactString(data.groupInstanceId)
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            errorCode: decoder.readInt16(),
            _tag2: decoder.readTagBuffer(),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, null, result);
        return result;
    },
});
