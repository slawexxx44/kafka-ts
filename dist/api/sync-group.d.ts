export type Assignment = {
    [topic: string]: number[];
};
export type MemberAssignment = {
    memberId: string;
    assignment: Assignment;
};
export declare const SYNC_GROUP: import("../utils/api").Api<{
    groupId: string;
    generationId: number;
    memberId: string;
    groupInstanceId: string | null;
    protocolType: string | null;
    protocolName: string | null;
    assignments: MemberAssignment[];
}, {
    _tag: void;
    throttleTimeMs: number;
    errorCode: number;
    protocolType: string | null;
    protocolName: string | null;
    assignments: Assignment;
    _tag2: void;
}>;
