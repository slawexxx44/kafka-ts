/// <reference types="node" />
export declare const JOIN_GROUP: import("../utils/api").Api<{
    groupId: string;
    sessionTimeoutMs: number;
    rebalanceTimeoutMs: number;
    memberId: string;
    groupInstanceId: string | null;
    protocolType: string;
    protocols: {
        name: string;
        metadata: {
            version: number;
            topics: string[];
        };
    }[];
    reason: string | null;
}, {
    _tag: void;
    throttleTimeMs: number;
    errorCode: number;
    generationId: number;
    protocolType: string | null;
    protocolName: string | null;
    leader: string;
    skipAssignment: boolean;
    memberId: string;
    members: {
        memberId: string;
        groupInstanceId: string | null;
        metadata: Buffer;
        _tag: void;
    }[];
    _tag2: void;
}>;
