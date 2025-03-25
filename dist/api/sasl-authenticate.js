"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SASL_AUTHENTICATE = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.SASL_AUTHENTICATE = (0, api_1.createApi)({
    apiKey: 36,
    apiVersion: 2,
    request: (encoder, data) => encoder.writeUVarInt(0).writeCompactBytes(data.authBytes).writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            errorCode: decoder.readInt16(),
            errorMessage: decoder.readCompactString(),
            authBytes: decoder.readCompactBytes(),
            sessionLifetimeMs: decoder.readInt64(),
            _tag2: decoder.readTagBuffer(),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, result.errorMessage, result);
        return result;
    },
});
