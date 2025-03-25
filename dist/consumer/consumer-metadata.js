"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerMetadata = void 0;
const metadata_1 = require("../metadata");
class ConsumerMetadata extends metadata_1.Metadata {
    assignment = {};
    getAssignment() {
        return this.assignment;
    }
    setAssignment(newAssignment) {
        this.assignment = newAssignment;
    }
}
exports.ConsumerMetadata = ConsumerMetadata;
