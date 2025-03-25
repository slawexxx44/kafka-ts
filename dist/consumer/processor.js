"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
const stream_1 = require("stream");
const tracer_1 = require("../utils/tracer");
const trace = (0, tracer_1.createTracer)('Processor');
class Processor extends stream_1.EventEmitter {
    options;
    isRunning = false;
    constructor(options) {
        super();
        this.options = options;
    }
    async loop() {
        this.isRunning = true;
        try {
            while (this.isRunning) {
                await this.step();
            }
        }
        finally {
            this.isRunning = false;
            this.emit('stopped');
        }
    }
    async step() {
        const { poll, process } = this.options;
        const batch = await poll();
        if (batch.length) {
            await process(batch);
        }
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        const stopPromise = new Promise((resolve) => {
            this.once('stopped', resolve);
        });
        this.isRunning = false;
        return stopPromise;
    }
}
exports.Processor = Processor;
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Processor.prototype, "step", null);
