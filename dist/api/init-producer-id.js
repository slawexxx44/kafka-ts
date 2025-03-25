"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIT_PRODUCER_ID = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.INIT_PRODUCER_ID = (0, api_1.createApi)({
    apiKey: 22,
    apiVersion: 4,
    request: (encoder, body) => encoder
        .writeUVarInt(0)
        .writeCompactString(body.transactionalId)
        .writeInt32(body.transactionTimeoutMs)
        .writeInt64(body.producerId)
        .writeInt16(body.producerEpoch)
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            errorCode: decoder.readInt16(),
            producerId: decoder.readInt64(),
            producerEpoch: decoder.readInt16(),
            _tag2: decoder.readTagBuffer(),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, null, result);
        return result;
    },
});
