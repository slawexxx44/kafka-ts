"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decoder = void 0;
class Decoder {
    buffer;
    offset = 0;
    constructor(buffer) {
        this.buffer = buffer;
    }
    getOffset() {
        return this.offset;
    }
    getBufferLength() {
        return this.buffer.length;
    }
    canReadBytes(bytes) {
        return this.getBufferLength() - this.getOffset() >= bytes;
    }
    readInt8() {
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return value;
    }
    readInt16() {
        const value = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return value;
    }
    readInt32() {
        const value = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return value;
    }
    readUInt32() {
        const value = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return value;
    }
    readInt64() {
        const value = this.buffer.readBigInt64BE(this.offset);
        this.offset += 8;
        return value;
    }
    readUVarInt() {
        let result = 0;
        let shift = 0;
        let currentByte;
        do {
            currentByte = this.buffer[this.offset++];
            result |= (currentByte & 0x7f) << shift;
            shift += 7;
        } while ((currentByte & 0x80) !== 0);
        return result;
    }
    readVarInt() {
        const decodedValue = this.readUVarInt();
        return (decodedValue >>> 1) ^ -(decodedValue & 1);
    }
    readUVarLong() {
        let result = BigInt(0);
        let shift = BigInt(0);
        let currentByte;
        do {
            currentByte = BigInt(this.buffer[this.offset++]);
            result |= (currentByte & BigInt(0x7f)) << shift;
            shift += BigInt(7);
        } while ((currentByte & BigInt(0x80)) !== BigInt(0));
        return result;
    }
    readVarLong() {
        const decodedValue = this.readUVarLong();
        return (decodedValue >> BigInt(1)) ^ -(decodedValue & BigInt(1));
    }
    readString() {
        const length = this.readInt16();
        if (length < 0) {
            return null;
        }
        const value = this.buffer.toString('utf-8', this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    readCompactString() {
        const length = this.readUVarInt() - 1;
        if (length < 0) {
            return null;
        }
        const value = this.buffer.toString('utf-8', this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    readVarIntString() {
        const length = this.readVarInt();
        if (length < 0) {
            return null;
        }
        const value = this.buffer.toString('utf-8', this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    readUUID() {
        const value = this.buffer.toString('hex', this.offset, this.offset + 16);
        this.offset += 16;
        return value;
    }
    readBoolean() {
        const value = this.buffer.readInt8(this.offset) === 1;
        this.offset += 1;
        return value;
    }
    readArray(callback) {
        const length = this.readInt32();
        const results = Array.from({ length }).map(() => callback(this));
        return results;
    }
    readCompactArray(callback) {
        const length = this.readUVarInt() - 1;
        const results = Array.from({ length }).map(() => callback(this));
        return results;
    }
    readVarIntArray(callback) {
        const length = this.readVarInt();
        const results = Array.from({ length }).map(() => callback(this));
        return results;
    }
    readRecords(callback) {
        const length = this.readInt32();
        return Array.from({ length }).map(() => {
            const size = this.readVarInt();
            if (!size) {
                return null;
            }
            const child = new Decoder(this.buffer.subarray(this.offset, this.offset + size));
            this.offset += size;
            return callback(child);
        }).filter(x => x !== null);
    }
    read(length) {
        const value = this.buffer.subarray(this.offset, length !== undefined ? this.offset + length : undefined);
        this.offset += value.length;
        return value;
    }
    readBytes() {
        const length = this.readInt32();
        return this.read(length);
    }
    readCompactBytes() {
        const length = this.readUVarInt() - 1;
        if (length < 0) {
            return null;
        }
        return this.read(length);
    }
    readTagBuffer() {
        this.readUVarInt();
    }
}
exports.Decoder = Decoder;
