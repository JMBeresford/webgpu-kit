import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithGpuSampler } from "./components/GpuSamplerObject";

const Mixins = WithGpuSampler(WithDevice(WithLabel()));

type SamplerOptions = {
  label?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  options?: GPUSamplerDescriptor;
};

export class Sampler extends Mixins {
  readonly binding: number;
  readonly visibility: GPUShaderStageFlags;

  constructor(options: SamplerOptions) {
    super();
    this.label = options.label;
    if (options.options !== undefined) {
      void this.updateSampler(options.options);
    }

    this.binding = options.binding;
    this.visibility = options.visibility;
  }
}
