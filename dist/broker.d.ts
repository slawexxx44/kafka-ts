/// <reference types="node" />
/// <reference types="node" />
import { TcpSocketConnectOpts } from 'net';
import { TLSSocketOptions } from 'tls';
import { SendRequest } from './connection';
export type SASLProvider = {
    mechanism: string;
    authenticate: (context: {
        sendRequest: SendRequest;
    }) => Promise<void>;
};
type BrokerOptions = {
    clientId: string | null;
    options: TcpSocketConnectOpts;
    sasl: SASLProvider | null;
    ssl: TLSSocketOptions | null;
    requestTimeout: number;
};
export declare class Broker {
    private options;
    private connection;
    sendRequest: SendRequest;
    constructor(options: BrokerOptions);
    connect(): Promise<this>;
    ensureConnected(): Promise<void>;
    disconnect(): Promise<void>;
    private validateApiVersions;
    private saslHandshake;
    private saslAuthenticate;
}
export {};
