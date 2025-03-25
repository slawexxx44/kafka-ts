"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lock = void 0;
const events_1 = __importDefault(require("events"));
const logger_1 = require("./logger");
class Lock extends events_1.default {
    locks = {};
    constructor() {
        super();
        this.setMaxListeners(Infinity);
    }
    async acquire(keys, callback) {
        await Promise.all(keys.map((key) => this.acquireKey(key)));
        try {
            await callback();
        }
        finally {
            keys.forEach((key) => this.releaseKey(key));
        }
    }
    async acquireKey(key) {
        while (this.locks[key]) {
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    logger_1.log.warn(`Lock timed out`, { key });
                    this.releaseKey(key);
                }, 60_000);
                this.once(`release:${key}`, () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        }
        this.locks[key] = true;
    }
    releaseKey(key) {
        this.locks[key] = false;
        this.emit(`release:${key}`);
    }
}
exports.Lock = Lock;
