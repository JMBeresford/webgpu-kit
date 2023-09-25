import type { Constructor } from "../utils";
import type { WithDevice } from "./Device";
import type { WithLabel } from "./Label";

export type WithGpuSampler = InstanceType<ReturnType<typeof WithGpuSampler>>;

export function WithGpuSampler<
  TBase extends Constructor<WithDevice & Partial<WithLabel>>,
>(Base: TBase) {
  return class extends Base {
    gpuSampler?: GPUSampler;
    samplerOptions: GPUSamplerDescriptor = {
      magFilter: "linear",
      minFilter: "linear",
    };

    async updateSampler(options?: GPUSamplerDescriptor): Promise<void> {
      if (options !== undefined) {
        this.samplerOptions = options;
      }

      const device = await this.getDevice();

      this.gpuSampler = device.createSampler({
        label: `${this.label ?? "Unlabelled"} Sampler`,
        ...this.samplerOptions,
      });
    }
  };
}
