"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRetrier = exports.createExponentialBackoffRetrier = void 0;
const delay_1 = require("./delay");
const logger_1 = require("./logger");
const createExponentialBackoffRetrier = ({ retries = 5, initialDelayMs = 100, maxDelayMs = 3000, multiplier = 2, onFailure = (error) => {
    throw error;
}, } = {}) => async (func) => {
    let retriesLeft = retries;
    let delayMs = initialDelayMs;
    let lastError;
    while (true) {
        try {
            await func();
            return;
        }
        catch (error) {
            lastError = error;
        }
        logger_1.log.debug(`Failed to process batch (retriesLeft: ${retriesLeft})`);
        if (--retriesLeft < 1)
            break;
        await (0, delay_1.delay)(delayMs);
        delayMs = Math.min(maxDelayMs, delayMs * multiplier);
    }
    await onFailure(lastError);
};
exports.createExponentialBackoffRetrier = createExponentialBackoffRetrier;
exports.defaultRetrier = (0, exports.createExponentialBackoffRetrier)();
