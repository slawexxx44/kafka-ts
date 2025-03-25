/// <reference types="node" />
/// <reference types="node" />
import { TcpSocketConnectOpts } from 'net';
import { TLSSocketOptions } from 'tls';
import { SASLProvider } from './broker';
import { Cluster } from './cluster';
import { Consumer, ConsumerOptions } from './consumer/consumer';
import { Producer, ProducerOptions } from './producer/producer';
export type ClientOptions = {
    clientId?: string | null;
    bootstrapServers: TcpSocketConnectOpts[];
    sasl?: SASLProvider | null;
    ssl?: TLSSocketOptions | null;
    requestTimeout?: number;
};
export declare class Client {
    private options;
    constructor(options: ClientOptions);
    startConsumer(options: ConsumerOptions): Promise<Consumer>;
    createProducer(options: ProducerOptions): Producer;
    createCluster(): Cluster;
}
export declare const createKafkaClient: (options: ClientOptions) => Client;
