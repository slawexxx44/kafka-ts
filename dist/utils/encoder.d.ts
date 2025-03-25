/// <reference types="node" />
export declare class Encoder {
    private chunks;
    getChunks(): Buffer[];
    getBufferLength(): number;
    write(...buffers: Buffer[]): this;
    writeEncoder(encoder: Encoder): this;
    writeInt8(value: number): this;
    writeInt16(value: number): this;
    writeInt32(value: number): this;
    writeUInt32(value: number): this;
    writeInt64(value: bigint): this;
    writeUVarInt(value: number): this;
    writeVarInt(value: number): this;
    writeUVarLong(value: bigint): this;
    writeVarLong(value: bigint): this;
    writeString(value: string | null): this;
    writeCompactString(value: string | null): this;
    writeVarIntString(value: string | null): this;
    writeUUID(value: string | null): this;
    writeBoolean(value: boolean): this;
    writeArray<T>(arr: T[], callback: (encoder: Encoder, item: T) => Encoder): this;
    writeCompactArray<T>(arr: T[] | null, callback: (encoder: Encoder, item: T) => Encoder): this;
    writeVarIntArray<T>(arr: T[], callback: (encoder: Encoder, item: T) => Encoder): this;
    writeBytes(value: Buffer): this;
    writeCompactBytes(value: Buffer): this;
    value(): Buffer;
}
