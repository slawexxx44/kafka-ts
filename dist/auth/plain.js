"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saslPlain = void 0;
const api_1 = require("../api");
const saslPlain = ({ username, password }) => ({
    mechanism: 'PLAIN',
    authenticate: async ({ sendRequest }) => {
        const authBytes = [null, username, password].join('\u0000');
        await sendRequest(api_1.API.SASL_AUTHENTICATE, { authBytes: Buffer.from(authBytes) });
    },
});
exports.saslPlain = saslPlain;
