"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTracer = exports.setTracer = void 0;
const logger_1 = require("./logger");
class DebugTracer {
    isEnabled = process.env.DEBUG?.includes('kafka-ts');
    startActiveSpan(module, method, metadata, callback) {
        if (!this.isEnabled) {
            return callback();
        }
        const startTime = Date.now();
        const onEnd = (result) => {
            logger_1.log.debug(`[${module}.${method}] ${metadata?.message ?? ''} +${Date.now() - startTime}ms`, {
                ...metadata,
                ...(!!result && { result }),
            });
            return result;
        };
        const result = callback();
        if (result instanceof Promise) {
            return result.then(onEnd);
        }
        onEnd(result);
        return result;
    }
}
let tracer = new DebugTracer();
const setTracer = (newTracer) => {
    tracer = newTracer;
};
exports.setTracer = setTracer;
const createTracer = (module) => (fn) => (target, propertyKey, descriptor) => {
    const original = descriptor.value;
    descriptor.value = function (...args) {
        const metadata = fn?.(...args);
        return tracer.startActiveSpan(module, propertyKey, { ...metadata }, () => original.apply(this, args));
    };
};
exports.createTracer = createTracer;
