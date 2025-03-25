"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
const delay = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));
exports.delay = delay;
