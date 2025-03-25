import { FetchResponse } from '../api/fetch';
import { Assignment } from '../api/sync-group';
type FetchManagerOptions = {
    fetch: (nodeId: number, assignment: Assignment) => Promise<FetchResponse>;
    process: (response: FetchResponse) => Promise<void>;
    nodeAssignments: {
        nodeId: number;
        assignment: Assignment;
    }[];
};
export declare class FetchManager {
    private options;
    private fetchers;
    constructor(options: FetchManagerOptions);
    start(): Promise<void>;
    stop(): Promise<void[]>;
}
export {};
