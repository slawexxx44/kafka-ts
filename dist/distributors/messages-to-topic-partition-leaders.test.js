"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const messages_to_topic_partition_leaders_1 = require("./messages-to-topic-partition-leaders");
(0, vitest_1.describe)('Distribute messages to partition leader ids', () => {
    (0, vitest_1.describe)('distributeMessagesToTopicPartitionLeaders', () => {
        (0, vitest_1.it)('snoke', () => {
            const result = (0, messages_to_topic_partition_leaders_1.distributeMessagesToTopicPartitionLeaders)([{ topic: 'topic', partition: 0, key: null, value: null, offset: 0n, timestamp: 0n, headers: {} }], { topic: { 0: 1 } });
            (0, vitest_1.expect)(result).toMatchInlineSnapshot(`
              {
                "1": {
                  "topic": {
                    "0": [
                      {
                        "headers": {},
                        "key": null,
                        "offset": 0n,
                        "partition": 0,
                        "timestamp": 0n,
                        "topic": "topic",
                        "value": null,
                      },
                    ],
                  },
                },
              }
            `);
        });
    });
});
