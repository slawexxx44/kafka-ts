/// <reference types="node" />
/// <reference types="node" />
import { TcpSocketConnectOpts } from 'net';
import { TLSSocketOptions } from 'tls';
import { Broker, SASLProvider } from './broker';
import { SendRequest } from './connection';
type ClusterOptions = {
    clientId: string | null;
    bootstrapServers: TcpSocketConnectOpts[];
    sasl: SASLProvider | null;
    ssl: TLSSocketOptions | null;
    requestTimeout: number;
};
export declare class Cluster {
    private options;
    private seedBroker;
    private brokerById;
    private brokerMetadata;
    constructor(options: ClusterOptions);
    connect(): Promise<void>;
    ensureConnected(): Promise<void>;
    disconnect(): Promise<void>;
    setSeedBroker: (nodeId: number) => Promise<void>;
    sendRequest: SendRequest;
    sendRequestToNode: (nodeId: number) => SendRequest;
    acquireBroker(nodeId: number): Promise<Broker>;
    private findSeedBroker;
}
export {};
