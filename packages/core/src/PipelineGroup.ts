import type { Pipeline } from "./Pipeline";
import type { Sampler } from "./Sampler";
import type { Storage } from "./Storage";
import type { Texture } from "./Texture";
import type { Uniform } from "./Uniform";
import type { VertexAttributeObject } from "./VertexAttributeObject";
import { WithCanvas } from "./components/Canvas";
import { WithDepthStencil } from "./components/DepthStencil";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithMultiSampling } from "./components/MultiSampling";

const Mixins = WithCanvas(
  WithDevice(WithMultiSampling(WithDepthStencil(WithLabel()))),
);

type PipelineGroupOptions = {
  label?: string;
  vertexAttributeObject?: VertexAttributeObject;
  pipelines?: Pipeline[];
  canvas?: HTMLCanvasElement;
  enableMultiSampling?: boolean;
  enableDepthStencil?: boolean;
};

export class PipelineGroup extends Mixins {
  private _bindGroup?: GPUBindGroup;
  private bindGroupLayout?: GPUBindGroupLayout;
  private pipelineLayout?: GPUPipelineLayout;
  vertexAttributeObject?: VertexAttributeObject;
  pipelines: Pipeline[];
  uniforms: Uniform[] = [];
  storages: Storage[] = [];
  textures: Texture[] = [];
  samplers: Sampler[] = [];

  constructor(options: PipelineGroupOptions) {
    super();
    this.label = options.label;
    this.vertexAttributeObject = options.vertexAttributeObject;
    this.pipelines = options.pipelines ?? [];

    if (options.canvas) {
      this.setCanvas(options.canvas);
    }

    if (options.enableMultiSampling) {
      this.setMultiSampleCount(4);
    }

    if (options.enableDepthStencil) {
      this.depthStencilEnabled = true;
    }
  }

  get bindGroup() {
    return this._bindGroup;
  }

  async addUniform(uniform: Uniform): Promise<void> {
    if (uniform.gpuBuffer === undefined && uniform.cpuBuffer !== undefined) {
      await uniform.setBuffer(uniform.cpuBuffer);
    }
    this.uniforms.push(uniform);
  }

  async addStorage(storage: Storage): Promise<void> {
    if (storage.gpuBuffer === undefined && storage.cpuBuffer !== undefined) {
      await storage.setBuffer(storage.cpuBuffer);
    }
    this.storages.push(storage);
  }

  async addTexture(texture: Texture): Promise<void> {
    if (texture.gpuTexture === undefined) {
      await texture.updateTexture();
    }
    this.textures.push(texture);
  }

  async addSampler(sampler: Sampler): Promise<void> {
    if (sampler.gpuSampler === undefined) {
      await sampler.updateSampler();
    }
    this.samplers.push(sampler);
  }

  async build() {
    await this.buildMultiSampleTexture();
    await this.buildDepthStencilTexture();
    await this.buildBindGroup();
    await this.buildPipelines();
  }

  private async buildBindGroup(): Promise<GPUBindGroup> {
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

    this.bindGroupLayout = device.createBindGroupLayout({
      label: layoutLabel,
      entries: layoutEntries,
    });

    this._bindGroup = device.createBindGroup({
      label,
      layout: this.bindGroupLayout,
      entries,
    });

    return this._bindGroup;
  }

  private async buildPipelines() {
    if (!this.bindGroupLayout) {
      throw new Error("Bind group layout not built");
    }

    const device = await this.getDevice();

    this.pipelineLayout = device.createPipelineLayout({
      label: `${this.label ?? "Unlabelled"} Pipeline Layout`,
      bindGroupLayouts: [this.bindGroupLayout],
    });

    await Promise.all(
      this.pipelines.map(async (pipeline) => {
        await pipeline.build();

        if (this.pipelineLayout === undefined) {
          throw new Error("Pipeline layout not built");
        }

        if (pipeline.shaderModule === undefined) {
          throw new Error("Shader module not set");
        }

        if (this.vertexAttributeObject?.layout === undefined) {
          throw new Error("Vertex attribute layout not set");
        }

        if (pipeline.type === "render") {
          pipeline.gpuPipeline = await device.createRenderPipelineAsync({
            label: `${pipeline.label ?? "Unlabelled"} Render Pipeline`,
            layout: this.pipelineLayout,
            vertex: {
              module: pipeline.shaderModule,
              entryPoint: pipeline.shaderEntries.vertex ?? "vertexMain",
              buffers: [this.vertexAttributeObject.layout],
            },
            fragment: {
              module: pipeline.shaderModule,
              entryPoint: pipeline.shaderEntries.fragment ?? "fragmentMain",
              targets: [
                {
                  format: this.canvasFormat,
                },
              ],
            },
            multisample: this.multiSampleState,
            depthStencil: this.depthStencilEnabled
              ? this.depthStencilState
              : undefined,
          });
        } else {
          pipeline.gpuPipeline = await device.createComputePipelineAsync({
            label: `${pipeline.label ?? "Unlabelled"} Compute Pipeline`,
            layout: this.pipelineLayout,
            compute: {
              module: pipeline.shaderModule,
              entryPoint: pipeline.shaderEntries.compute ?? "computeMain",
            },
          });
        }
      }),
    );
  }
}
