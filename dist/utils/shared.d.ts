export declare const shared: <F extends () => Promise<any>>(func: F) => () => ReturnType<F>;
