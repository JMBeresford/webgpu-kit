import type { Constructor, ArrayType } from "../utils";
import { fallbackToEmpty } from "../utils";

export type WithCpuBuffer = InstanceType<ReturnType<typeof WithCpuBuffer>>;

export function WithCpuBuffer<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) {
    cpuBuffer?: ArrayType;

    setCpuBuffer(buffer: ArrayType): void {
      this.cpuBuffer = buffer;
    }
  };
}
