import type { BindGroup } from "./BindGroup";
import type { IndexBuffer } from "./IndexBuffer";
import type { Pipeline } from "./Pipeline";
import type { VertexAttributeObject } from "./VertexAttributeObject";
import { WithCanvas } from "./components/Canvas";
import { WithDepthStencil } from "./components/DepthStencil";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithMultiSampling } from "./components/MultiSampling";

const Mixins = WithCanvas(
  WithDevice(WithMultiSampling(WithDepthStencil(WithLabel()))),
);

/**
 * {@link PipelineGroup} constructor parameters
 */
export type PipelineGroupOptions = {
  label?: string;
  pipelines?: Pipeline[];
  canvas?: HTMLCanvasElement;
  enableMultiSampling?: boolean;
  enableDepthStencil?: boolean;
  instanceCount?: number;
  vertexCount: number;
};

/**
 * A group of {@link Pipeline}s that share the same {@link VertexAttributeObject}
 * and bind group layout.
 *
 */
export class PipelineGroup extends Mixins {
  private _pipelineLayout?: GPUPipelineLayout;
  private _bindGroups: BindGroup[] = [];

  vertexAttributeObjects: VertexAttributeObject[] = [];
  pipelines: Pipeline[];
  instanceCount: number;
  indexBuffer?: IndexBuffer;
  vertexCount: number;

  constructor(options: PipelineGroupOptions) {
    super();
    this.label = options.label;
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

    this.instanceCount = options.instanceCount ?? 1;
    this.vertexCount = options.vertexCount;
  }

  get bindGroups() {
    return this._bindGroups;
  }

  addBindGroup(bindGroup: BindGroup): void {
    this._bindGroups.push(bindGroup);
  }

  addVertexAttributeObject(vertexAttributeObject: VertexAttributeObject): void {
    this.vertexAttributeObjects.push(vertexAttributeObject);
  }

  setInstanceCount(count: number) {
    this.instanceCount = count;
  }

  async setIndexBuffer(indexBuffer: IndexBuffer) {
    this.indexBuffer = indexBuffer;
    await this.indexBuffer.updateGpuBuffer();
  }

  async build() {
    await this.buildMultiSampleTexture();
    await this.buildDepthStencilTexture();
    await this.buildPipelines();
  }

  private async buildPipelines() {
    const device = await this.getDevice();

    const layouts = this.bindGroups
      .sort((a, b) => a.index - b.index)
      .map((bg) => bg.layout);

    if (layouts.some((layout) => layout === undefined)) {
      throw new Error("Bind group layout not set");
    }

    const bindGroupLayouts = layouts as GPUBindGroupLayout[];

    this._pipelineLayout = device.createPipelineLayout({
      label: `${this.label ?? "Unlabelled"} Pipeline Layout`,
      bindGroupLayouts,
    });

    await Promise.all(
      this.pipelines.map(async (pipeline) => {
        await pipeline.build();

        if (this._pipelineLayout === undefined) {
          throw new Error("Pipeline layout not built");
        }

        if (pipeline.shaderModule === undefined) {
          throw new Error("Shader module not set");
        }

        if (pipeline.type === "render") {
          const vaoLayouts: GPUVertexBufferLayout[] = [];
          this.vertexAttributeObjects.forEach((vao) => {
            if (vao.layout === undefined) {
              throw new Error("Vertex attribute layout not set");
            }
            vaoLayouts.push(vao.layout);
          });

          pipeline.gpuPipeline = await device.createRenderPipelineAsync({
            label: `${pipeline.label ?? "Unlabelled"} Render Pipeline`,
            layout: this._pipelineLayout,
            vertex: {
              module: pipeline.shaderModule,
              entryPoint: pipeline.shaderEntries.vertex ?? "vertexMain",
              buffers: vaoLayouts,
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
            layout: this._pipelineLayout,
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
