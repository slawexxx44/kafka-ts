"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saslScramSha512 = exports.saslScramSha256 = void 0;
const api_1 = require("../api");
const crypto_1 = require("../utils/crypto");
const error_1 = require("../utils/error");
const saslScram = ({ mechanism, keyLength, digest }) => ({ username, password }) => ({
    mechanism,
    authenticate: async ({ sendRequest }) => {
        const nonce = (0, crypto_1.generateNonce)();
        const firstMessage = `n=${username},r=${nonce}`;
        const { authBytes } = await sendRequest(api_1.API.SASL_AUTHENTICATE, {
            authBytes: Buffer.from(`n,,${firstMessage}`),
        });
        if (!authBytes) {
            throw new error_1.KafkaTSError('No auth response');
        }
        const response = Object.fromEntries(authBytes
            .toString()
            .split(',')
            .map((pair) => pair.split('=')));
        const rnonce = response.r;
        if (!rnonce.startsWith(nonce)) {
            throw new error_1.KafkaTSError('Invalid nonce');
        }
        const iterations = parseInt(response.i);
        const salt = (0, crypto_1.base64Decode)(response.s);
        const saltedPassword = await (0, crypto_1.saltPassword)(password, salt, iterations, keyLength, digest);
        const clientKey = (0, crypto_1.hmac)(saltedPassword, 'Client Key', digest);
        const clientKeyHash = (0, crypto_1.hash)(clientKey, digest);
        let finalMessage = `c=${(0, crypto_1.base64Encode)('n,,')},r=${rnonce}`;
        const fullMessage = `${firstMessage},${authBytes.toString()},${finalMessage}`;
        const clientSignature = (0, crypto_1.hmac)(clientKeyHash, fullMessage, digest);
        const clientProof = (0, crypto_1.base64Encode)((0, crypto_1.xor)(clientKey, clientSignature));
        finalMessage += `,p=${clientProof}`;
        await sendRequest(api_1.API.SASL_AUTHENTICATE, { authBytes: Buffer.from(finalMessage) });
    },
});
exports.saslScramSha256 = saslScram({ mechanism: 'SCRAM-SHA-256', keyLength: 32, digest: 'sha256' });
exports.saslScramSha512 = saslScram({ mechanism: 'SCRAM-SHA-512', keyLength: 64, digest: 'sha512' });
