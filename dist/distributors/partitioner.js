"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPartitioner = void 0;
const murmur2_1 = require("../utils/murmur2");
const defaultPartitioner = ({ metadata }) => {
    const topicCounterMap = {};
    const getNextValue = (topic) => {
        topicCounterMap[topic] ??= 0;
        return topicCounterMap[topic]++;
    };
    return ({ topic, partition, key }) => {
        if (partition !== null && partition !== undefined) {
            return partition;
        }
        const partitions = metadata.getTopicPartitions()[topic];
        const numPartitions = partitions.length;
        if (key) {
            return (0, murmur2_1.toPositive)((0, murmur2_1.murmur2)(Buffer.from(key))) % numPartitions;
        }
        return (0, murmur2_1.toPositive)(getNextValue(topic)) % numPartitions;
    };
};
exports.defaultPartitioner = defaultPartitioner;
