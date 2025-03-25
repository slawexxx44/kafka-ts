"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encoder = void 0;
class Encoder {
    chunks = [];
    getChunks() {
        return this.chunks;
    }
    getBufferLength() {
        return this.chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    }
    write(...buffers) {
        this.chunks.push(...buffers);
        return this;
    }
    writeEncoder(encoder) {
        return this.write(...encoder.getChunks());
    }
    writeInt8(value) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(value);
        return this.write(buffer);
    }
    writeInt16(value) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16BE(value);
        return this.write(buffer);
    }
    writeInt32(value) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32BE(value);
        return this.write(buffer);
    }
    writeUInt32(value) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(value);
        return this.write(buffer);
    }
    writeInt64(value) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigInt64BE(value);
        return this.write(buffer);
    }
    writeUVarInt(value) {
        const byteArray = [];
        while ((value & 0xffffff80) !== 0) {
            byteArray.push((value & 0x7f) | 0x80);
            value >>>= 7;
        }
        byteArray.push(value & 0x7f);
        return this.write(Buffer.from(byteArray));
    }
    writeVarInt(value) {
        const encodedValue = (value << 1) ^ (value >> 31);
        return this.writeUVarInt(encodedValue);
    }
    writeUVarLong(value) {
        const byteArray = [];
        while ((value & 0xffffffffffffff80n) !== 0n) {
            byteArray.push(Number((value & BigInt(0x7f)) | BigInt(0x80)));
            value >>= 7n;
        }
        byteArray.push(Number(value & BigInt(0x7f)));
        return this.write(Buffer.from(byteArray));
    }
    writeVarLong(value) {
        const encodedValue = (value << BigInt(1)) ^ (value >> BigInt(63));
        return this.writeUVarLong(encodedValue);
    }
    writeString(value) {
        if (value === null) {
            return this.writeInt16(-1);
        }
        const buffer = Buffer.from(value, 'utf-8');
        return this.writeInt16(buffer.length).write(buffer);
    }
    writeCompactString(value) {
        if (value === null) {
            return this.writeUVarInt(0);
        }
        const buffer = Buffer.from(value, 'utf-8');
        return this.writeUVarInt(buffer.length + 1).write(buffer);
    }
    writeVarIntString(value) {
        if (value === null) {
            return this.writeVarInt(-1);
        }
        const buffer = Buffer.from(value, 'utf-8');
        return this.writeVarInt(buffer.length).write(buffer);
    }
    writeUUID(value) {
        if (value === null) {
            return this.write(Buffer.alloc(16));
        }
        return this.write(Buffer.from(value, 'hex'));
    }
    writeBoolean(value) {
        return this.writeInt8(value ? 1 : 0);
    }
    writeArray(arr, callback) {
        return this.writeInt32(arr.length).write(...arr.flatMap((item) => callback(new Encoder(), item).getChunks()));
    }
    writeCompactArray(arr, callback) {
        if (arr === null) {
            return this.writeUVarInt(0);
        }
        return this.writeUVarInt(arr.length + 1).write(...arr.flatMap((item) => callback(new Encoder(), item).getChunks()));
    }
    writeVarIntArray(arr, callback) {
        return this.writeVarInt(arr.length).write(...arr.flatMap((item) => callback(new Encoder(), item).getChunks()));
    }
    writeBytes(value) {
        return this.writeInt32(value.length).write(value);
    }
    writeCompactBytes(value) {
        return this.writeUVarInt(value.length + 1).write(value);
    }
    value() {
        return Buffer.concat(this.chunks);
    }
}
exports.Encoder = Encoder;
