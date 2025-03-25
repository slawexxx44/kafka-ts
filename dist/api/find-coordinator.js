"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIND_COORDINATOR = exports.KEY_TYPE = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.KEY_TYPE = {
    GROUP: 0,
    TRANSACTION: 1,
};
exports.FIND_COORDINATOR = (0, api_1.createApi)({
    apiKey: 10,
    apiVersion: 4,
    request: (encoder, data) => encoder
        .writeUVarInt(0)
        .writeInt8(data.keyType)
        .writeCompactArray(data.keys, (encoder, key) => encoder.writeCompactString(key))
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            coordinators: decoder.readCompactArray((decoder) => ({
                key: decoder.readCompactString(),
                nodeId: decoder.readInt32(),
                host: decoder.readCompactString(),
                port: decoder.readInt32(),
                errorCode: decoder.readInt16(),
                errorMessage: decoder.readCompactString(),
                _tag: decoder.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        result.coordinators.forEach((coordinator) => {
            if (coordinator.errorCode)
                throw new error_1.KafkaTSApiError(coordinator.errorCode, coordinator.errorMessage, result);
        });
        return result;
    },
});
