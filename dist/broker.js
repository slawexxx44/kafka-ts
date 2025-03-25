"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Broker = void 0;
const api_1 = require("./api");
const connection_1 = require("./connection");
const error_1 = require("./utils/error");
class Broker {
    options;
    connection;
    sendRequest;
    constructor(options) {
        this.options = options;
        this.connection = new connection_1.Connection({
            clientId: this.options.clientId,
            connection: this.options.options,
            ssl: this.options.ssl,
            requestTimeout: this.options.requestTimeout,
        });
        this.sendRequest = this.connection.sendRequest.bind(this.connection);
    }
    async connect() {
        await this.connection.connect();
        await this.validateApiVersions();
        await this.saslHandshake();
        await this.saslAuthenticate();
        return this;
    }
    async ensureConnected() {
        if (!this.connection.isConnected()) {
            await this.connect();
        }
    }
    async disconnect() {
        await this.connection.disconnect();
    }
    async validateApiVersions() {
        const { versions } = await this.sendRequest(api_1.API.API_VERSIONS, {});
        const apiByKey = Object.fromEntries(Object.values(api_1.API).map((api) => [api.apiKey, api]));
        versions.forEach(({ apiKey, minVersion, maxVersion }) => {
            if (!apiByKey[apiKey]) {
                return;
            }
            const { apiVersion } = apiByKey[apiKey];
            if (apiVersion < minVersion || apiVersion > maxVersion) {
                throw new error_1.KafkaTSError(`API ${apiKey} version ${apiVersion} is not supported by the broker (minVersion=${minVersion}, maxVersion=${maxVersion})`);
            }
        });
    }
    async saslHandshake() {
        if (!this.options.sasl) {
            return;
        }
        await this.sendRequest(api_1.API.SASL_HANDSHAKE, { mechanism: this.options.sasl.mechanism });
    }
    async saslAuthenticate() {
        await this.options.sasl?.authenticate({ sendRequest: this.sendRequest });
    }
}
exports.Broker = Broker;
