import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";

export interface GpuBufferComponent {
  gpuBuffer?: GPUBuffer;
  usage: GPUBufferUsageFlags;
}

export type WithGpuBuffer = InstanceType<ReturnType<typeof WithGpuBuffer>>;

export function WithGpuBuffer<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) implements GpuBufferComponent {
    gpuBuffer?: GPUBuffer;
    usage: GPUBufferUsageFlags = GPUBufferUsage.COPY_DST;
  };
}
