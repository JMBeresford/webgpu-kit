import type { Constructor } from "../utils";

export function WithGpuBuffer<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    gpuBuffer?: GPUBuffer;
    usage: GPUBufferUsageFlags = GPUBufferUsage.COPY_DST;
  };
}
