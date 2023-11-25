import { WithCanvas } from "./Canvas";
import { WithDevice } from "./Device";
import { WithLabel } from "./Label";

const components = WithDevice(WithCanvas(WithLabel()));

export function WithGpuSampler<TBase extends typeof components>(Base: TBase) {
  return class extends Base {
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
