"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SASL_HANDSHAKE = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.SASL_HANDSHAKE = (0, api_1.createApi)({
    apiKey: 17,
    apiVersion: 1,
    request: (encoder, data) => encoder.writeString(data.mechanism),
    response: (decoder) => {
        const result = {
            errorCode: decoder.readInt16(),
            mechanisms: decoder.readArray((mechanism) => mechanism.readString()),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, null, result);
        return result;
    },
});
