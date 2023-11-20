import { WithCpuBuffer } from "./components/CpuBuffer";
import { WithDevice } from "./components/Device";
import { WithGpuTexture } from "./components/GpuTextureObject";
import { WithLabel } from "./components/Label";

const Mixins = WithGpuTexture(WithCpuBuffer(WithDevice(WithLabel())));

/**
 * {@link Texture} constructor parameters
 */
export type TextureOptions = {
  label?: string;

  /**
   * The binding number of the texture object in the {@link BindGroup}.
   */
  binding: number;

  /**
   * The shader stages that this uniform is visible to.
   * e.g. GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT would make the uniform
   * visible to both the vertex and fragment shaders.
   */
  visibility: GPUShaderStageFlags;
};

/**
 * A GPU texture object that can be used in a {@link BindGroup}.
 */
export class Texture extends Mixins {
  readonly binding: number;
  readonly visibility: GPUShaderStageFlags;

  constructor(options: TextureOptions) {
    super();
    this.label = options.label;
    this.binding = options.binding;
    this.visibility = options.visibility;
  }
}
