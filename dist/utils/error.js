"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionError = exports.KafkaTSApiError = exports.KafkaTSError = void 0;
const api_1 = require("../api");
class KafkaTSError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.KafkaTSError = KafkaTSError;
class KafkaTSApiError extends KafkaTSError {
    errorCode;
    errorMessage;
    response;
    apiName;
    request;
    constructor(errorCode, errorMessage, response) {
        const [errorName] = Object.entries(api_1.API_ERROR).find(([, value]) => value === errorCode) ?? ['UNKNOWN'];
        super(`${errorName}${errorMessage ? `: ${errorMessage}` : ''}`);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.response = response;
    }
}
exports.KafkaTSApiError = KafkaTSApiError;
class ConnectionError extends KafkaTSError {
}
exports.ConnectionError = ConnectionError;
