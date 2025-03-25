/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'stream';
import { FetchResponse } from '../api/fetch';
import { Assignment } from '../api/sync-group';
type FetcherOptions = {
    nodeId: number;
    assignment: Assignment;
    fetch: (nodeId: number, assignment: Assignment) => Promise<FetchResponse>;
    process: (response: FetchResponse) => Promise<void>;
};
export declare class Fetcher extends EventEmitter<{
    stopped: [];
}> {
    private options;
    private isRunning;
    constructor(options: FetcherOptions);
    loop(): Promise<void>;
    private step;
    stop(): Promise<void>;
}
export {};
