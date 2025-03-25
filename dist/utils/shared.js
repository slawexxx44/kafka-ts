"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shared = void 0;
const shared = (func) => {
    let promise;
    return () => {
        if (!promise) {
            promise = func();
            promise.finally(() => {
                promise = undefined;
            });
        }
        return promise;
    };
};
exports.shared = shared;
