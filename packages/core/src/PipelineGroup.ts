import type { Pipeline } from "./Pipeline";
import type { Storage } from "./Storage";
import type { Uniform } from "./Uniform";
import type { VertexAttributeObject } from "./VertexAttributeObject";
import { WithCanvas } from "./components/Canvas";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";

const Mixins = WithCanvas(WithDevice(WithLabel()));

type PipelineGroupOptions = {
  label?: string;
  vertexAttributeObject?: VertexAttributeObject;
  pipelines?: Pipeline[];
  canvas?: HTMLCanvasElement;
};

export class PipelineGroup extends Mixins {
  private _bindGroup?: GPUBindGroup;
  private bindGroupLayout?: GPUBindGroupLayout;
  private pipelineLayout?: GPUPipelineLayout;
  vertexAttributeObject?: VertexAttributeObject;
  pipelines: Pipeline[];
  uniforms: Uniform[] = [];
  storages: Storage[] = [];

  constructor(options: PipelineGroupOptions) {
    super();
    this.label = options.label;
    this.vertexAttributeObject = options.vertexAttributeObject;
    this.pipelines = options.pipelines ?? [];

    if (options.canvas) {
      this.setCanvas(options.canvas);
    }
  }

  get bindGroup() {
    return this._bindGroup;
  }

  async addUniform(uniform: Uniform): Promise<this> {
    if (uniform.gpuBuffer === undefined && uniform.cpuBuffer !== undefined) {
      await uniform.setBuffer(uniform.cpuBuffer);
    }
    this.uniforms.push(uniform);

    return this;
  }

  async addStorage(storage: Storage): Promise<this> {
    if (storage.gpuBuffer === undefined && storage.cpuBuffer !== undefined) {
      await storage.setBuffer(storage.cpuBuffer);
    }
    this.storages.push(storage);

    return this;
  }

  async build() {
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
