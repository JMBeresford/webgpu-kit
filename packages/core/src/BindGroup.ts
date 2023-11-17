import type { Sampler } from "./Sampler";
import type { Storage } from "./Storage";
import type { Texture } from "./Texture";
import type { Uniform } from "./Uniform";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";

const mixins = WithDevice(WithLabel());

/**
 * {@link BindGroup} constructor parameters
 */
export type BindGroupOptions = {
  label?: string;
  index?: number;
};

/**
 * A group of {@link Uniform}s, {@link Storage}s, {@link Texture}s and {@link Sampler}s
 * that share the same {@link GPUBindGroupLayout}.
 */
export class BindGroup extends mixins {
  private _layout?: GPUBindGroupLayout;
  private _group?: GPUBindGroup;
  private _index;

  uniforms: Uniform[] = [];
  storages: Storage[] = [];
  textures: Texture[] = [];
  samplers: Sampler[] = [];

  constructor(options: BindGroupOptions = {}) {
    super();
    this.label = options.label;
    this._index = options.index ?? 0;
  }

  get layout() {
    return this._layout;
  }

  get group() {
    return this._group;
  }

  get index() {
    return this._index;
  }

  async addUniform(...uniforms: Uniform[]): Promise<void> {
    await Promise.all(
      uniforms.map(async (uniform) => {
        if (uniform.gpuBuffer === undefined) {
          await uniform.updateGpuBuffer();
        }
      }),
    );

    this.uniforms.push(...uniforms);
    await this.updateBindGroup();
  }

  async addStorage(...storages: Storage[]): Promise<void> {
    await Promise.all(
      storages.map(async (storage) => {
        if (storage.gpuBuffer === undefined) {
          await storage.updateGpuBuffer();
        }
      }),
    );

    this.storages.push(...storages);
    await this.updateBindGroup();
  }

  async addTexture(...textures: Texture[]): Promise<void> {
    await Promise.all(
      textures.map(async (texture) => {
        if (texture.gpuTexture === undefined) {
          await texture.updateTexture();
        }
      }),
    );

    this.textures.push(...textures);
    await this.updateBindGroup();
  }

  async addSampler(...samplers: Sampler[]): Promise<void> {
    await Promise.all(
      samplers.map(async (sampler) => {
        if (sampler.gpuSampler === undefined) {
          await sampler.updateSampler();
        }
      }),
    );

    this.samplers.push(...samplers);
    await this.updateBindGroup();
  }

  private async updateBindGroup(): Promise<GPUBindGroup> {
    const label = `${this.label ?? "Unlabelled"} Bind Group`;
    const layoutLabel = `${this.label ?? "Unlabelled"} Bind Group Layout`;
    const entries: GPUBindGroupEntry[] = [];
    const layoutEntries: GPUBindGroupLayoutEntry[] = [];

    for (const uniform of this.uniforms) {
      if (uniform.gpuBuffer === undefined) {
        throw new Error("Uniform buffer not set");
      }

      entries.push({
        binding: uniform.binding,
        resource: {
          buffer: uniform.gpuBuffer,
        },
      });

      layoutEntries.push({
        binding: uniform.binding,
        visibility: uniform.visibility,
        buffer: {
          type: "uniform",
        },
      });
    }

    for (const storage of this.storages) {
      if (storage.gpuBuffer === undefined) {
        throw new Error("Storage buffer not set");
      }

      entries.push({
        binding: storage.binding,
        resource: {
          buffer: storage.gpuBuffer,
        },
      });

      layoutEntries.push({
        binding: storage.binding,
        visibility: storage.visibility,
        buffer: storage.bufferOptions,
      });
    }

    for (const texture of this.textures) {
      if (texture.gpuTexture === undefined) {
        throw new Error("Texture not set");
      }

      entries.push({
        binding: texture.binding,
        resource: texture.gpuTexture.createView(),
      });

      layoutEntries.push({
        binding: texture.binding,
        visibility: texture.visibility,
        texture: {
          multisampled: texture.gpuTexture.sampleCount > 1,
        },
      });
    }

    for (const sampler of this.samplers) {
      if (sampler.gpuSampler === undefined) {
        throw new Error("Sampler not set");
      }

      entries.push({
        binding: sampler.binding,
        resource: sampler.gpuSampler,
      });

      layoutEntries.push({
        binding: sampler.binding,
        visibility: sampler.visibility,
        sampler: {},
      });
    }

    const device = await this.getDevice();

    this._layout = device.createBindGroupLayout({
      label: layoutLabel,
      entries: layoutEntries,
    });

    this._group = device.createBindGroup({
      label,
      layout: this._layout,
      entries,
    });

    return this._group;
  }
}
