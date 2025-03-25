export declare const LEAVE_GROUP: import("../utils/api").Api<{
    groupId: string;
    members: {
        memberId: string;
        groupInstanceId: string | null;
        reason: string | null;
    }[];
}, {
    _tag: void;
    throttleTimeMs: number;
    errorCode: number;
    members: {
        memberId: string;
        groupInstanceId: string | null;
        errorCode: number;
        _tag: void;
    }[];
    _tag2: void;
}>;
