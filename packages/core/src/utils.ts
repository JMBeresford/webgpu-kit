export type Constructor = new (...args: any[]) => any;
export type ConstructorWithArgs<T> = new (...args: any[]) => T;
export type ArrayType = Float32Array | Uint32Array | Uint16Array | Uint8Array;
