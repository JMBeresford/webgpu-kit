import type { Constructor, ArrayType, ConstructorArgs } from "../utils";
import { fallbackToEmpty } from "../utils";

export type WithCpuBuffer = InstanceType<ReturnType<typeof WithCpuBuffer>>;

export function WithCpuBuffer<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) {
    cpuBuffer?: ArrayType;

    constructor(...args: ConstructorArgs) {
      super(args);
    }

    setArrayBuffer(buffer: ArrayType): void {
      this.cpuBuffer = buffer;
    }
  };
}
