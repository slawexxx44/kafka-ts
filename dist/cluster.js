"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cluster = void 0;
const api_1 = require("./api");
const broker_1 = require("./broker");
const error_1 = require("./utils/error");
const logger_1 = require("./utils/logger");
class Cluster {
    options;
    seedBroker;
    brokerById = {};
    brokerMetadata = {};
    constructor(options) {
        this.options = options;
    }
    async connect() {
        this.seedBroker = await this.findSeedBroker();
        this.brokerById = {};
        const metadata = await this.sendRequest(api_1.API.METADATA, { topics: [] });
        this.brokerMetadata = Object.fromEntries(metadata.brokers.map((options) => [options.nodeId, options]));
    }
    async ensureConnected() {
        if (!this.seedBroker) {
            return this.connect();
        }
        try {
            await Promise.all([this.seedBroker, ...Object.values(this.brokerById)].map((x) => x.ensureConnected()));
        }
        catch {
            logger_1.log.warn('Failed to connect to known brokers, reconnecting...');
            await this.disconnect();
            return this.connect();
        }
    }
    async disconnect() {
        await Promise.all([
            this.seedBroker?.disconnect(),
            ...Object.values(this.brokerById).map((x) => x.disconnect()),
        ]);
    }
    setSeedBroker = async (nodeId) => {
        await this.seedBroker?.disconnect();
        this.seedBroker = await this.acquireBroker(nodeId);
    };
    sendRequest = (...args) => this.seedBroker.sendRequest(...args);
    sendRequestToNode = (nodeId) => async (...args) => {
        if (!this.brokerById[nodeId]) {
            this.brokerById[nodeId] = await this.acquireBroker(nodeId);
        }
        return this.brokerById[nodeId].sendRequest(...args);
    };
    async acquireBroker(nodeId) {
        if (!(nodeId in this.brokerMetadata)) {
            throw new error_1.KafkaTSError(`Broker ${nodeId} is not available`);
        }
        const broker = new broker_1.Broker({
            clientId: this.options.clientId,
            sasl: this.options.sasl,
            ssl: this.options.ssl,
            requestTimeout: this.options.requestTimeout,
            options: this.brokerMetadata[nodeId],
        });
        await broker.connect();
        return broker;
    }
    async findSeedBroker() {
        const randomizedBrokers = this.options.bootstrapServers.toSorted(() => Math.random() - 0.5);
        for (const options of randomizedBrokers) {
            try {
                const broker = new broker_1.Broker({
                    clientId: this.options.clientId,
                    sasl: this.options.sasl,
                    ssl: this.options.ssl,
                    requestTimeout: this.options.requestTimeout,
                    options,
                });
                await broker.connect();
                return broker;
            }
            catch (error) {
                logger_1.log.warn(`Failed to connect to seed broker ${options.host}:${options.port}`, error);
            }
        }
        throw new error_1.KafkaTSError('No seed brokers found');
    }
}
exports.Cluster = Cluster;
