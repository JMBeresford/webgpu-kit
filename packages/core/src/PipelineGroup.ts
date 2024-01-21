import type { BindGroup } from "./BindGroup";
import type { IndexBuffer } from "./IndexBuffer";
import { RenderPipeline } from "./Pipeline";
import type { Pipeline } from "./Pipeline";
import type { VertexAttributeObject } from "./VertexAttributeObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";

const components = WithDevice(WithLabel());

/**
 * {@link PipelineGroup} constructor parameters
 */
export type PipelineGroupOptions = {
  label?: string;
  pipelines?: Pipeline[];
  instanceCount?: number;

  /**
   * The number of vertices to draw in a render pipeline.
   */
  vertexCount: number;
};

/**
 * A group of {@link Pipeline}s that share the same {@link VertexAttributeObject}s
 * and {@link BindGroup}s.
 */
export class PipelineGroup extends components {
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

    this.instanceCount = options.instanceCount ?? 1;
    this.vertexCount = options.vertexCount;
  }

  get bindGroups() {
    return this._bindGroups;
  }

  async setBindGroups(...bindGroups: BindGroup[]): Promise<void> {
    await Promise.all(
      bindGroups.map(async (bindGroup) => {
        if (bindGroup.group === undefined) {
          await bindGroup.updateBindGroup();
        }
      }),
    );

    this._bindGroups = bindGroups;
    await this.updatePipelineLayout();
  }

  addVertexAttributeObjects(
    ...vertexAttributeObjects: VertexAttributeObject[]
  ): void {
    this.vertexAttributeObjects.push(...vertexAttributeObjects);
  }

  setInstanceCount(count: number) {
    this.instanceCount = count;
  }

  async setIndexBuffer(indexBuffer: IndexBuffer) {
    this.indexBuffer = indexBuffer;
    await this.indexBuffer.updateGpuBuffer();
  }

  async build() {
    await this.buildPipelines();
  }

  private async updatePipelineLayout() {
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
  }

  private async buildPipelines() {
    await Promise.all(
      this.pipelines.map(async (pipeline) => {
        if (this._pipelineLayout === undefined) {
          throw new Error("Pipeline layout not built");
        }

        if (pipeline instanceof RenderPipeline) {
          const buffers: GPUVertexBufferLayout[] = [];
          this.vertexAttributeObjects.forEach((vao) => {
            if (vao.layout === undefined) {
              throw new Error("Vertex attribute layout not set");
            }
            buffers.push(vao.layout);
          });

          await pipeline.build(this._pipelineLayout, buffers);
        } else {
          await pipeline.build(this._pipelineLayout);
        }
      }),
    );
  }
}
