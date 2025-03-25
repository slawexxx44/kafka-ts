"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeMessagesToTopicPartitionLeaders = void 0;
const distributeMessagesToTopicPartitionLeaders = (messages, topicPartitionLeader) => {
    const result = {};
    messages.forEach((message) => {
        const leaderId = topicPartitionLeader[message.topic][message.partition];
        result[leaderId] ??= {};
        result[leaderId][message.topic] ??= {};
        result[leaderId][message.topic][message.partition] ??= [];
        result[leaderId][message.topic][message.partition].push(message);
    });
    return result;
};
exports.distributeMessagesToTopicPartitionLeaders = distributeMessagesToTopicPartitionLeaders;
