import { WithCpuBuffer } from "./components/CpuBuffer";
import { WithDevice } from "./components/Device";
import { WithGpuTexture } from "./components/GpuTextureObject";
import { WithLabel } from "./components/Label";

const Mixins = WithGpuTexture(WithCpuBuffer(WithDevice(WithLabel())));

type TextureOptions = {
  label?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
};

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
