"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogger = exports.log = exports.jsonSerializer = void 0;
const jsonSerializer = (_, v) => {
    if (v instanceof Error) {
        return Object.getOwnPropertyNames(v).reduce((acc, key) => {
            acc[key] = v[key];
            return acc;
        }, {});
    }
    if (Buffer.isBuffer(v)) {
        return v.toString();
    }
    if (typeof v === 'bigint') {
        return v.toString();
    }
    return v;
};
exports.jsonSerializer = jsonSerializer;
class JsonLogger {
    debug(message, metadata) {
        console.debug(JSON.stringify({ message, metadata, level: 'debug' }, exports.jsonSerializer));
    }
    info(message, metadata) {
        console.info(JSON.stringify({ message, metadata, level: 'info' }, exports.jsonSerializer));
    }
    warn(message, metadata) {
        console.warn(JSON.stringify({ message, metadata, level: 'warning' }, exports.jsonSerializer));
    }
    error(message, metadata) {
        console.error(JSON.stringify({ message, metadata, level: 'error' }, exports.jsonSerializer));
    }
}
exports.log = new JsonLogger();
const setLogger = (newLogger) => {
    exports.log = newLogger;
};
exports.setLogger = setLogger;
