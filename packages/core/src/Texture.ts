import { WithCpuBuffer } from "./components/CpuBuffer";
import { WithDevice } from "./components/Device";
import { WithGpuTexture } from "./components/GpuTextureObject";
import { WithLabel } from "./components/Label";
import { getDataFromImage, type ArrayType } from "./utils";

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

  async setFromImage(image: HTMLImageElement | string): Promise<void> {
    if (typeof image === "string") {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image();
          img.onload = async (ev: Event) => {
            const el = ev.target as HTMLImageElement;
            this.setTextureSize(el.naturalWidth, el.naturalHeight);

            const data = getDataFromImage(el);

            this.setArrayBuffer(data);
            await this.updateTexture();
            resolve();
          };

          img.src = image;
        } catch (err) {
          reject(err);
        }
      });
    }

    const data = getDataFromImage(image);
    this.setArrayBuffer(data);
  }

  async setFromData(data: ArrayType): Promise<void> {
    this.setArrayBuffer(data);
    await this.updateTexture();
  }
}
