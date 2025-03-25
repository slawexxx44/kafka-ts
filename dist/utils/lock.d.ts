/// <reference types="node" />
import EventEmitter from 'events';
export declare class Lock extends EventEmitter {
    private locks;
    constructor();
    acquire(keys: string[], callback: () => Promise<void>): Promise<void>;
    private acquireKey;
    private releaseKey;
}
