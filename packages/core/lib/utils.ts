export type Constructor = new (...args: any[]) => any;
export type ConstructorWithArgs<T> = new (...args: any[]) => T;
