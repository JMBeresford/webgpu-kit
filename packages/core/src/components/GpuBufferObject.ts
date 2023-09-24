import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";

export type WithGpuBuffer = InstanceType<
  ReturnType<typeof WithGpuBufferObject>
>;

export function WithGpuBufferObject<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) {
    gpuBuffer?: GPUBuffer;
    usage: GPUBufferUsageFlags = GPUBufferUsage.COPY_DST;
  };
}
