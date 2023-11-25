import type { Constructor, ArrayType } from "../utils";

export function WithCpuBuffer<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    cpuBuffer?: ArrayType;

    setCpuBuffer(buffer: ArrayType): void {
      this.cpuBuffer = buffer;
    }
  };
}
