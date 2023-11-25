import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithGpuSampler } from "./components/GpuSamplerObject";
import { WithCanvas } from "./components/Canvas";

const components = WithGpuSampler(WithDevice(WithCanvas(WithLabel())));

/**
 * {@link Sampler} constructor parameters
 */
export type SamplerOptions = {
  label?: string;
  binding: number;

  /**
   * The shader stages that this uniform is visible to.
   * e.g. GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT would make the uniform
   * visible to both the vertex and fragment shaders.
   */
  visibility: GPUShaderStageFlags;
  options?: GPUSamplerDescriptor;
};

/**
 * Sampler object used to sample textures in a shader.
 */
export class Sampler extends components {
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
