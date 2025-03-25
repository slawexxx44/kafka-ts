/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'stream';
import { Batch } from '../types';
type ProcessorOptions = {
    poll: () => Promise<Batch>;
    process: (batch: Batch) => Promise<void>;
};
export declare class Processor extends EventEmitter<{
    stopped: [];
}> {
    private options;
    private isRunning;
    constructor(options: ProcessorOptions);
    loop(): Promise<void>;
    private step;
    stop(): Promise<void>;
}
export {};
