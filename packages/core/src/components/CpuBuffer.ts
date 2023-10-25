import type { Constructor, ArrayType } from "../utils";
import { fallbackToEmpty } from "../utils";

export interface CpuBufferComponent {
  cpuBuffer?: ArrayType;

  setCpuBuffer: (buffer: ArrayType) => void;
}

export type WithCpuBuffer = InstanceType<ReturnType<typeof WithCpuBuffer>>;

export function WithCpuBuffer<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) implements CpuBufferComponent {
    cpuBuffer?: ArrayType;

    setCpuBuffer(buffer: ArrayType): void {
      this.cpuBuffer = buffer;
    }
  };
}
