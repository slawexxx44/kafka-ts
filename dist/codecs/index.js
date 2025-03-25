"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCodec = void 0;
const gzip_1 = require("./gzip");
const none_1 = require("./none");
const codecs = {
    0: none_1.NONE,
    1: gzip_1.GZIP,
};
const findCodec = (type) => {
    const codec = codecs[type];
    if (!codec) {
        throw new Error(`Unsupported codec: ${type}`);
    }
    return codec;
};
exports.findCodec = findCodec;
