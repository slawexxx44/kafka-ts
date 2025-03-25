"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEAVE_GROUP = void 0;
const api_1 = require("../utils/api");
const error_1 = require("../utils/error");
exports.LEAVE_GROUP = (0, api_1.createApi)({
    apiKey: 13,
    apiVersion: 5,
    request: (encoder, body) => encoder
        .writeUVarInt(0)
        .writeCompactString(body.groupId)
        .writeCompactArray(body.members, (encoder, member) => encoder
        .writeCompactString(member.memberId)
        .writeCompactString(member.groupInstanceId)
        .writeCompactString(member.reason)
        .writeUVarInt(0))
        .writeUVarInt(0),
    response: (decoder) => {
        const result = {
            _tag: decoder.readTagBuffer(),
            throttleTimeMs: decoder.readInt32(),
            errorCode: decoder.readInt16(),
            members: decoder.readCompactArray((decoder) => ({
                memberId: decoder.readCompactString(),
                groupInstanceId: decoder.readCompactString(),
                errorCode: decoder.readInt16(),
                _tag: decoder.readTagBuffer(),
            })),
            _tag2: decoder.readTagBuffer(),
        };
        if (result.errorCode)
            throw new error_1.KafkaTSApiError(result.errorCode, null, result);
        result.members.forEach((member) => {
            if (member.errorCode)
                throw new error_1.KafkaTSApiError(member.errorCode, null, result);
        });
        return result;
    },
});
