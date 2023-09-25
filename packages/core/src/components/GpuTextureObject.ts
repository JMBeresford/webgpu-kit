import type { Constructor } from "../utils";
import type { WithCpuBuffer } from "./CpuBuffer";
import type { WithDevice } from "./Device";
import type { WithLabel } from "./Label";

export type WithGpuTexture = InstanceType<ReturnType<typeof WithGpuTexture>>;

export function WithGpuTexture<
  TBase extends Constructor<WithCpuBuffer & WithDevice & Partial<WithLabel>>,
>(Base: TBase) {
  return class extends Base {
    gpuTexture?: GPUTexture;
    textureFormat: GPUTextureFormat = "rgba8unorm";
    textureWidth = 1;
    textureHeight = 1;
    textureUsage: GPUTextureUsageFlags =
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;

    setTextureFormat(format: GPUTextureFormat): void {
      this.textureFormat = format;
    }

    setTextureUsage(usage: GPUTextureUsageFlags): void {
      this.textureUsage =
        usage | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
    }

    setTextureSize(width: number, height: number): void {
      this.textureWidth = width;
      this.textureHeight = height;
    }

    async updateTexture() {
      const device = await this.getDevice();

      if (!this.gpuTexture) {
        this.gpuTexture = device.createTexture({
          label: `${this.label ?? "Unlabelled"} Texture`,
          size: [this.textureWidth, this.textureHeight],
          format: this.textureFormat,
          usage: this.textureUsage,
        });
      }

      const data = this.cpuBuffer ?? new Uint8Array([0]);

      device.queue.writeTexture(
        {
          texture: this.gpuTexture,
        },
        data,
        {
          bytesPerRow: data.BYTES_PER_ELEMENT * 4 * this.textureWidth,
        },
        { width: this.textureWidth, height: this.textureHeight },
      );
    }
  };
}
