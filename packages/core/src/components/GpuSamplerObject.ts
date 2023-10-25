import type { Constructor } from "../utils";
import type { WithDevice } from "./Device";
import type { WithLabel } from "./Label";

export interface GpuSamplerComponent {
  gpuSampler?: GPUSampler;
  samplerOptions: GPUSamplerDescriptor;

  updateSampler: (options?: GPUSamplerDescriptor) => Promise<void>;
}

export type WithGpuSampler = InstanceType<ReturnType<typeof WithGpuSampler>>;

export function WithGpuSampler<
  TBase extends Constructor<WithDevice & Partial<WithLabel>>,
>(Base: TBase) {
  return class extends Base implements GpuSamplerComponent {
    gpuSampler?: GPUSampler;
    samplerOptions: GPUSamplerDescriptor = {
      magFilter: "linear",
      minFilter: "linear",
      addressModeU: "repeat",
      addressModeV: "repeat",
      mipmapFilter: "linear",
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
