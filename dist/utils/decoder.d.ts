/// <reference types="node" />
export declare class Decoder {
    private buffer;
    private offset;
    constructor(buffer: Buffer);
    getOffset(): number;
    getBufferLength(): number;
    canReadBytes(bytes: number): boolean;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readUInt32(): number;
    readInt64(): bigint;
    readUVarInt(): number;
    readVarInt(): number;
    readUVarLong(): bigint;
    readVarLong(): bigint;
    readString(): string | null;
    readCompactString(): string | null;
    readVarIntString(): string | null;
    readUUID(): string;
    readBoolean(): boolean;
    readArray<T>(callback: (opts: Decoder) => T): T[];
    readCompactArray<T>(callback: (opts: Decoder) => T): T[];
    readVarIntArray<T>(callback: (opts: Decoder) => T): T[];
    readRecords<T>(callback: (opts: Decoder) => T): T[];
    read(length?: number): Buffer;
    readBytes(): Buffer;
    readCompactBytes(): Buffer | null;
    readTagBuffer(): void;
}
