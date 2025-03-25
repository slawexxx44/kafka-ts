export interface Tracer {
    startActiveSpan<T>(module: string, method: string, metadata: Record<string, unknown>, callback: () => T): T;
}
export declare const setTracer: (newTracer: Tracer) => void;
export declare const createTracer: (module: string) => (fn?: (...args: any[]) => Record<string, unknown> | undefined) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
