"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafkaClient = exports.Client = void 0;
const cluster_1 = require("./cluster");
const consumer_1 = require("./consumer/consumer");
const producer_1 = require("./producer/producer");
class Client {
    options;
    constructor(options) {
        this.options = {
            ...options,
            clientId: options.clientId ?? null,
            sasl: options.sasl ?? null,
            ssl: options.ssl ?? null,
            requestTimeout: options.requestTimeout ?? 60_000,
        };
    }
    async startConsumer(options) {
        const consumer = new consumer_1.Consumer(this.createCluster(), options);
        await consumer.start();
        return consumer;
    }
    createProducer(options) {
        return new producer_1.Producer(this.createCluster(), options);
    }
    createCluster() {
        return new cluster_1.Cluster({
            clientId: this.options.clientId,
            bootstrapServers: this.options.bootstrapServers,
            sasl: this.options.sasl,
            ssl: this.options.ssl,
            requestTimeout: this.options.requestTimeout,
        });
    }
}
exports.Client = Client;
const createKafkaClient = (options) => new Client(options);
exports.createKafkaClient = createKafkaClient;
