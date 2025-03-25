"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const assignments_to_replicas_1 = require("./assignments-to-replicas");
(0, vitest_1.describe)('Distribute assignments to replica ids', () => {
    (0, vitest_1.describe)('distributeAssignmentsToNodesBalanced', () => {
        (0, vitest_1.it)('smoke', () => {
            const result = (0, assignments_to_replicas_1.distributeAssignmentsToNodesBalanced)({ topic: [0, 1] }, { topic: { 0: [0, 1], 1: [1, 2] } });
            (0, vitest_1.expect)(result).toMatchInlineSnapshot(`
              {
                "1": {
                  "topic": [
                    0,
                  ],
                },
                "2": {
                  "topic": [
                    1,
                  ],
                },
              }
            `);
        });
    });
    (0, vitest_1.describe)('distributeAssignmentsToNodesOptimized', () => {
        (0, vitest_1.it)('smoke', () => {
            const result = (0, assignments_to_replicas_1.distributeAssignmentsToNodesOptimized)({ topic: [0, 1] }, { topic: { 0: [0, 1], 1: [1, 2] } });
            (0, vitest_1.expect)(result).toMatchInlineSnapshot(`
              {
                "1": {
                  "topic": [
                    0,
                    1,
                  ],
                },
              }
            `);
        });
    });
});
