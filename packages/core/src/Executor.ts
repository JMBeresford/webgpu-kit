import type { PipelineGroup } from "./PipelineGroup";
import { WithLabel } from "./components/Label";
import { clamp } from "./utils";

const Mixins = WithLabel();

/**
 * {@link Executor} constructor parameters
 */
export type ExecutorOptions = {
  label?: string;
  autoResizeCanvas?: boolean;
};

/**
 * An executor class that executes each pipeline in its contained
 * {@link PipelineGroup}s.
 */
export class Executor extends Mixins {
  pipelineGroups: PipelineGroup[] = [];
  autoResizeCanvas: boolean;

  constructor(options: ExecutorOptions) {
    super();
    this.label = options.label;
    this.autoResizeCanvas = options.autoResizeCanvas ?? true;
  }

  async addPipelineGroup(group: PipelineGroup): Promise<this> {
    await group.build();
    this.pipelineGroups.push(group);

    return this;
  }

  private async runPipelineGroup(group: PipelineGroup): Promise<void> {
    const vaos = group.vertexAttributeObjects;
    const bindGroups = group.bindGroups;

    if (vaos.length === 0) {
      throw new Error("Vertex attribute object not set");
    }

    const { context } = group;
    const device = await group.getDevice();

    if (this.autoResizeCanvas) {
      await this.handleResize(group);
    }

    const commandEncoder = device.createCommandEncoder();

    await Promise.all(
      group.pipelines.map(async (pipeline) => {
        await pipeline.onBeforePass(pipeline);

        if (
          pipeline.type === "render" &&
          pipeline.gpuPipeline instanceof GPURenderPipeline
        ) {
          const multiSampleTextureView =
            group.multiSampleState.count > 1
              ? group.multiSampleTextureView
              : undefined;

          const view =
            multiSampleTextureView ?? context.getCurrentTexture().createView();

          const resolveTarget = multiSampleTextureView
            ? context.getCurrentTexture().createView()
            : undefined;

          const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
              {
                view,
                resolveTarget,
                loadOp: pipeline.clearColor ? "clear" : "load",
                clearValue: pipeline.clearColor,
                storeOp: "store",
              } satisfies GPURenderPassColorAttachment,
            ],
            depthStencilAttachment: undefined,
          };

          if (group.depthStencilEnabled && group.depthStencilTextureView) {
            renderPassDescriptor.depthStencilAttachment = {
              view: group.depthStencilTextureView,
              ...group.depthStencilAttachment,
            };
          }

          const pass = commandEncoder.beginRenderPass(renderPassDescriptor);

          pass.setPipeline(pipeline.gpuPipeline);
          let i = 0;
          for (const vao of vaos) {
            if (vao.gpuBuffer === undefined) {
              throw new Error("GPU buffer not set");
            }
            pass.setVertexBuffer(i, vao.gpuBuffer);
            i++;
          }

          bindGroups.forEach((bindGroup) => {
            if (!bindGroup.group) {
              throw new Error("Bind group not set");
            }
            pass.setBindGroup(bindGroup.index, bindGroup.group);
          });

          const indexBuffer = group.indexBuffer;

          if (indexBuffer?.gpuBuffer !== undefined) {
            const fmt =
              indexBuffer.cpuBuffer instanceof Uint32Array
                ? "uint32"
                : "uint16";
            pass.setIndexBuffer(indexBuffer.gpuBuffer, fmt);
            pass.drawIndexed(
              indexBuffer.indexCount ?? indexBuffer.cpuBuffer.length,
              group.instanceCount,
              indexBuffer.firstIndex,
            );
          } else {
            pass.draw(group.vertexCount, group.instanceCount);
          }

          pass.end();
        } else if (
          pipeline.type === "compute" &&
          pipeline.gpuPipeline instanceof GPUComputePipeline
        ) {
          const pass = commandEncoder.beginComputePass();
          pass.setPipeline(pipeline.gpuPipeline);

          bindGroups.forEach((bindGroup) => {
            if (!bindGroup.group) {
              throw new Error("Bind group not set");
            }

            pass.setBindGroup(bindGroup.index, bindGroup.group);
          });

          pass.dispatchWorkgroups(
            pipeline.workgroupCount[0],
            pipeline.workgroupCount[1],
            pipeline.workgroupCount[2],
          );
          pass.end();
        }

        await pipeline.onAfterPass(pipeline);
      }),
    );

    device.queue.submit([commandEncoder.finish()]);
  }

  async handleResize(group: PipelineGroup): Promise<void> {
    const { canvas } = group;
    const device = await group.getDevice();

    const targetWidth = clamp(
      canvas.clientWidth,
      1,
      device.limits.maxTextureDimension2D,
    );

    const targetHeight = clamp(
      canvas.clientHeight,
      1,
      device.limits.maxTextureDimension2D,
    );

    if (targetHeight !== canvas.height || targetWidth !== canvas.width) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      group.configureContext();

      await group.buildMultiSampleTexture();
      await group.buildDepthStencilTexture();
    }
  }

  /**
   * Run each pipline in each of the executor's contained pipelineGroups
   */
  async run(): Promise<void> {
    await Promise.all(
      this.pipelineGroups.map(async (group) => {
        await this.runPipelineGroup(group);
      }),
    );
  }
}
