"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_VERSIONS = void 0;
const api_js_1 = require("../utils/api.js");
const error_js_1 = require("../utils/error.js");
exports.API_VERSIONS = (0, api_js_1.createApi)({
    apiKey: 18,
    apiVersion: 2,
    request: (encoder) => encoder,
    response: (decoder) => {
        const result = {
            errorCode: decoder.readInt16(),
            versions: decoder.readArray((version) => ({
                apiKey: version.readInt16(),
                minVersion: version.readInt16(),
                maxVersion: version.readInt16(),
            })),
            throttleTimeMs: decoder.readInt32(),
        };
        if (result.errorCode)
            throw new error_js_1.KafkaTSApiError(result.errorCode, null, result);
        return result;
    },
});
