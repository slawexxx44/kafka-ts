export interface Logger {
    debug: (message: string, metadata?: unknown) => void;
    info: (message: string, metadata?: unknown) => void;
    warn: (message: string, metadata?: unknown) => void;
    error: (message: string, metadata?: unknown) => void;
}
export declare const jsonSerializer: (_: unknown, v: unknown) => unknown;
export declare let log: Logger;
export declare const setLogger: (newLogger: Logger) => void;
