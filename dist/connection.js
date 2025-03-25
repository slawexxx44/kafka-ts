"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const assert_1 = __importDefault(require("assert"));
const net_1 = __importStar(require("net"));
const tls_1 = __importDefault(require("tls"));
const api_1 = require("./api");
const decoder_1 = require("./utils/decoder");
const encoder_1 = require("./utils/encoder");
const error_1 = require("./utils/error");
const logger_1 = require("./utils/logger");
const tracer_1 = require("./utils/tracer");
const trace = (0, tracer_1.createTracer)('Connection');
class Connection {
    options;
    socket = new net_1.Socket();
    queue = {};
    lastCorrelationId = 0;
    chunks = [];
    shouldReconnect = false;
    constructor(options) {
        this.options = options;
    }
    isConnected() {
        return !this.socket.pending && !this.socket.destroyed;
    }
    async connect() {
        this.queue = {};
        this.chunks = [];
        this.shouldReconnect = true;
        await new Promise((resolve, reject) => {
            const { ssl, connection } = this.options;
            this.socket = ssl
                ? tls_1.default.connect({
                    ...connection,
                    ...ssl,
                    ...(connection.host && !(0, net_1.isIP)(connection.host) && { servername: connection.host }),
                }, resolve)
                : net_1.default.connect(connection, resolve);
            this.socket.once('error', reject);
        });
        this.socket.removeAllListeners('error');
        this.socket.on('error', (error) => logger_1.log.debug('Socket error', { error }));
        this.socket.on('data', (data) => this.handleData(data));
        this.socket.on('connectionAttemptTimeout', (data) => logger_1.log.debug('connectionAttemptTimeout', { data }));
        this.socket.on('close', (data) => logger_1.log.debug('close', { data }));
        this.socket.on('timeout', (data) => logger_1.log.debug('timeout', { data }));
        this.socket.once('close', async () => {
            Object.values(this.queue).forEach(({ reject }) => {
                reject(new error_1.ConnectionError('Socket closed unexpectedly'));
            });
            this.queue = {};
            if (this.shouldReconnect) {
                logger_1.log.debug('Attempting to reconnect after unexpected socket close...');
                try {
                    await this.connect(); // ponowna próba połączenia
                    logger_1.log.debug('Reconnected successfully.');
                }
                catch (err) {
                    logger_1.log.error('Reconnect attempt failed:', err);
                    // Opcjonalnie: można spróbować kolejnych prób reconnectu z opóźnieniem
                    // lub emitować zdarzenie do warstwy wyżej
                }
            }
            else {
                logger_1.log.debug('Socket closed by user request, not reconnecting.');
            }
        });
    }
    disconnect() {
        this.shouldReconnect = false;
        this.socket.removeAllListeners();
        return new Promise((resolve) => {
            if (!this.isConnected()) {
                return resolve();
            }
            this.socket.end(resolve);
        });
    }
    async sendRequest(api, body) {
        const correlationId = this.nextCorrelationId();
        const apiName = (0, api_1.getApiName)(api);
        const encoder = new encoder_1.Encoder()
            .writeInt16(api.apiKey)
            .writeInt16(api.apiVersion)
            .writeInt32(correlationId)
            .writeString(this.options.clientId);
        const request = api.request(encoder, body);
        const requestEncoder = new encoder_1.Encoder().writeInt32(request.getBufferLength()).writeEncoder(request);
        let timeout;
        const { responseDecoder, responseSize } = await new Promise(async (resolve, reject) => {
            timeout = setTimeout(() => {
                delete this.queue[correlationId];
                reject(new error_1.ConnectionError(`${apiName} timed out`));
            }, this.options.requestTimeout);
            try {
                this.queue[correlationId] = { resolve, reject };
                await this.write(requestEncoder.value());
            }
            catch (error) {
                reject(error);
            }
        });
        clearTimeout(timeout);
        try {
            const response = await api.response(responseDecoder);
            (0, assert_1.default)(responseDecoder.getOffset() === responseSize, `Buffer not correctly consumed: ${responseDecoder.getOffset()} !== ${responseSize}`);
            return response;
        }
        catch (error) {
            if (error instanceof error_1.KafkaTSApiError) {
                error.apiName = apiName;
                error.request = body;
            }
            throw error;
        }
    }
    write(buffer) {
        return new Promise((resolve, reject) => {
            const { stack } = new Error('Write error');
            this.socket.write(buffer, 'binary', (error) => {
                if (error) {
                    const err = new error_1.ConnectionError(error.message);
                    err.stack += `\n${stack}`;
                    return reject(err);
                }
                resolve();
            });
        });
    }
    handleData(buffer) {
        this.chunks.push(buffer);
        const decoder = new decoder_1.Decoder(Buffer.concat(this.chunks));
        if (!decoder.canReadBytes(4))
            return;
        const responseSize = decoder.readInt32();
        if (!decoder.canReadBytes(responseSize))
            return;
        const responseDecoder = new decoder_1.Decoder(decoder.read(responseSize));
        const correlationId = responseDecoder.readInt32();
        const context = this.queue[correlationId];
        if (context) {
            delete this.queue[correlationId];
            context.resolve({ responseDecoder, responseSize });
        }
        else {
            logger_1.log.debug('Could not find pending request for correlationId', { correlationId });
        }
        this.chunks = [];
        const remaining = decoder.read();
        if (remaining.length)
            this.handleData(remaining);
    }
    nextCorrelationId() {
        return this.lastCorrelationId++;
    }
    handleError() {
    }
}
exports.Connection = Connection;
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Connection.prototype, "connect", null);
__decorate([
    trace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Connection.prototype, "disconnect", null);
__decorate([
    trace((api, body) => ({ message: (0, api_1.getApiName)(api), body })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], Connection.prototype, "sendRequest", null);
