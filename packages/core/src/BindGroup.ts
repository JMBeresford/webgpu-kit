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

  /**
   * The index of the bind group. This is used to determine which bind group
   * to use in a shader (denoted by the value of the group directive).
   *
   * e.g.
   * ```wgsl
   *  @group(0) @binding(0) var tex: texture_2d<f32>;
   *  @group(0) @binding(1) var texSampler: sampler;
   * ```
   * would have an index of 0.
   */
  index?: number;

  /**
   * The {@link GPUBindGroupLayout} that describes the bindings in this bind group.
   * If not set, a bind group layout will be generated from the resources in this
   * bind group.
   */
  layout?: GPUBindGroupLayout;
};

/**
 * A group of {@link Uniform}s, {@link Storage}s, {@link Texture}s and {@link Sampler}s
 * described by a {@link GPUBindGroupLayout}. This is used to bind resources to a
 * GPU resource (e.g. {@link GPUBuffer}, {@link GPUTexture}) in a shader.
 */
export class BindGroup extends mixins {
  private _givenLayout?: GPUBindGroupLayout;
  private _generatedLayout?: GPUBindGroupLayout;
  private _group?: GPUBindGroup;

  index: number;
  uniforms: Uniform[] = [];
  storages: Storage[] = [];
  textures: Texture[] = [];
  samplers: Sampler[] = [];

  constructor(options: BindGroupOptions = {}) {
    super();
    this.label = options.label;
    this.index = options.index ?? 0;
    this._givenLayout = options.layout;
  }

  get layout() {
    return this._givenLayout ?? this._generatedLayout;
  }

  get group() {
    return this._group;
  }

  async addUniforms(...uniforms: Uniform[]): Promise<void> {
    await Promise.all(
      uniforms.map(async (uniform) => {
        if (uniform.gpuBuffer === undefined) {
          await uniform.updateGpuBuffer();
        }
      }),
    );

    this.uniforms.push(...uniforms);
  }

  async addStorages(...storages: Storage[]): Promise<void> {
    await Promise.all(
      storages.map(async (storage) => {
        if (storage.gpuBuffer === undefined) {
          await storage.updateGpuBuffer();
        }
      }),
    );

    this.storages.push(...storages);
  }

  async addTextures(...textures: Texture[]): Promise<void> {
    await Promise.all(
      textures.map(async (texture) => {
        if (texture.gpuTexture === undefined) {
          await texture.updateTexture();
        }
      }),
    );

    this.textures.push(...textures);
  }

  async addSamplers(...samplers: Sampler[]): Promise<void> {
    await Promise.all(
      samplers.map(async (sampler) => {
        if (sampler.gpuSampler === undefined) {
          await sampler.updateSampler();
        }
      }),
    );

    this.samplers.push(...samplers);
  }

  /**
   * Update the {@link GPUBindGroup} and {@link GPUBindGroupLayout} for this
   * bind group, if using an automatically generated layout. This will create
   * a new bind group and bind group layout if one does not already exist. This
   * will generally only be called once, after all resources have been added to
   * the bind group.
   */
  async updateBindGroup(): Promise<GPUBindGroup> {
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

    this._generatedLayout = device.createBindGroupLayout({
      label: layoutLabel,
      entries: layoutEntries,
    });

    if (!this.layout) {
      throw new Error("Bind group layout not set");
    }

    this._group = device.createBindGroup({
      label,
      layout: this.layout,
      entries,
    });

    return this._group;
  }
}
