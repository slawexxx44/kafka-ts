"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GZIP = void 0;
const zlib_1 = require("zlib");
exports.GZIP = {
    compress: async (data) => new Promise((resolve, reject) => (0, zlib_1.gzip)(data, (err, result) => (err ? reject(err) : resolve(result)))),
    decompress: async (data) => new Promise((resolve, reject) => (0, zlib_1.unzip)(data, (err, result) => (err ? reject(err) : resolve(result)))),
};
