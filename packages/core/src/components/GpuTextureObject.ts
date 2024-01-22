import { getDataFromImage, bilinearInterpolation } from "../utils";
import type { ArrayType } from "../utils";
import { WithDevice } from "./Device";
import { WithLabel } from "./Label";

export type MipMap = { data: Uint8ClampedArray; width: number; height: number };

const components = WithDevice(WithLabel());

export function WithGpuTexture<TBase extends typeof components>(Base: TBase) {
  return class extends Base {
    /** @internal */
    _mipmaps: MipMap[] = [];
    declare cpuBuffer?: Uint8ClampedArray;
    gpuTexture?: GPUTexture;
    textureFormat: GPUTextureFormat = "rgba8unorm";
    textureWidth = 1;
    textureHeight = 1;
    textureUsage: GPUTextureUsageFlags =
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT;

    setTextureFormat(format: GPUTextureFormat): void {
      this.textureFormat = format;
    }

    setTextureUsage(usage: GPUTextureUsageFlags): void {
      this.textureUsage =
        usage |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT;
    }

    setTextureSize(width: number, height: number): void {
      this.textureWidth = width;
      this.textureHeight = height;
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

              this.setCpuBuffer(data);
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
      await this.setFromData(data);
    }

    setCpuBuffer(buffer: Uint8ClampedArray): void {
      this.cpuBuffer = buffer;
    }

    async setFromData(data: ArrayType): Promise<void> {
      let _data = data;
      if (!(_data instanceof Uint8ClampedArray)) {
        _data = new Uint8ClampedArray(data);
      }
      this.setCpuBuffer(_data);
      await this.updateTexture();
    }

    async generateMipMaps(): Promise<void> {
      const data = this.cpuBuffer ?? new Uint8ClampedArray([0]);

      this._mipmaps = getMipMaps(data, this.textureWidth, this.textureHeight);
      await this.updateTexture();
    }

    async _createTexture(replace = false): Promise<void> {
      if (this.gpuTexture) {
        if (!replace) {
          return;
        }

        this.gpuTexture.destroy();
      }

      const device = await this.getDevice();

      this.gpuTexture = device.createTexture({
        label: `${this.label ?? "Unlabelled"} Texture`,
        size: [this.textureWidth, this.textureHeight],
        mipLevelCount: Math.max(this._mipmaps.length, 1),
        format: this.textureFormat,
        usage: this.textureUsage,
      });
    }

    async updateTexture() {
      const device = await this.getDevice();

      await this._createTexture(true);
      if (!this.gpuTexture) {
        throw new Error("Could not create texture");
      }

      if (this._mipmaps.length > 0) {
        for (let i = 0; i < this._mipmaps.length; i++) {
          const mip = this._mipmaps[i];
          device.queue.writeTexture(
            {
              texture: this.gpuTexture,
              mipLevel: i,
            },
            mip.data,
            {
              bytesPerRow: mip.data.BYTES_PER_ELEMENT * 4 * mip.width,
            },
            { width: mip.width, height: mip.height },
          );
        }
      } else {
        const data = this.cpuBuffer ?? new Uint8ClampedArray([0]);
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
    }
  };
}

/*
 * Ref: https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html
 */
function getMipMaps(
  texData: Uint8ClampedArray,
  texWidth: number,
  texHeight?: number,
): MipMap[] {
  const width = texWidth;
  const height = texHeight ?? texData.length / 4 / texWidth;
  let mip = { data: texData, width, height };

  const mipMaps: {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  }[] = [mip];

  while (mip.width > 1 && mip.height > 1) {
    mip = nextMipLevel(mip.data, mip.width, mip.height);
    mipMaps.push(mip);
  }

  return mipMaps;
}

function nextMipLevel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): MipMap {
  function getPixel(x: number, y: number) {
    const offset = (y * width + x) * 4;
    return data.subarray(offset, offset + 4);
  }

  const nextWidth = Math.max(Math.floor(width / 2), 1);
  const nextHeight = Math.max(Math.floor(height / 2), 1);

  const nextData = new Uint8ClampedArray(nextWidth * nextHeight * 4);

  for (let y = 0; y < nextHeight; y++) {
    for (let x = 0; x < nextWidth; x++) {
      const u = (x + 0.5) / nextWidth;
      const v = (y + 0.5) / nextHeight;

      const au = u * width - 0.5;
      const av = v * height - 0.5;

      const tx = au | 0;
      const ty = av | 0;

      const t1 = au % 1;
      const t2 = av % 1;

      const topLeft = getPixel(tx, ty);
      const topRight = getPixel(tx + 1, ty);
      const bottomLeft = getPixel(tx, ty + 1);
      const bottomRight = getPixel(tx + 1, ty + 1);

      const pixel = bilinearInterpolation(
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        t1,
        t2,
      );

      const offset = (y * nextWidth + x) * 4;
      nextData.set(pixel, offset);
    }
  }

  return {
    data: nextData,
    width: nextWidth,
    height: nextHeight,
  };
}
