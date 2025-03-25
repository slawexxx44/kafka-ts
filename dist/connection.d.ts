/// <reference types="node" />
/// <reference types="node" />
import { TcpSocketConnectOpts } from 'net';
import { TLSSocketOptions } from 'tls';
import { Api } from './utils/api';
type ConnectionOptions = {
    clientId: string | null;
    connection: TcpSocketConnectOpts;
    ssl: TLSSocketOptions | null;
    requestTimeout: number;
};
export declare class Connection {
    private options;
    private socket;
    private queue;
    private lastCorrelationId;
    private chunks;
    private shouldReconnect;
    constructor(options: ConnectionOptions);
    isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest<Request, Response>(api: Api<Request, Response>, body: Request): Promise<Response>;
    private write;
    private handleData;
    private nextCorrelationId;
    private handleError;
}
export type SendRequest = typeof Connection.prototype.sendRequest;
export {};
