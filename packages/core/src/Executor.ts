import type { PipelineGroup } from "./PipelineGroup";
import type { Pipeline } from "./Pipeline";
import { WithLabel } from "./components/Label";
import { clamp } from "./utils";

const components = WithLabel();

/**
 * {@link Executor} constructor parameters
 */
export type ExecutorOptions = {
  label?: string;
  autoResizeCanvas?: boolean;
};

/**
 * An executor class that executes each pipeline in its contained
 * {@link PipelineGroup}s. This is the main entry point for rendering
 * a scene, or executing compute operations.
 */
export class Executor extends components {
  pipelineGroups: PipelineGroup[] = [];
  autoResizeCanvas = true;

  constructor(options?: ExecutorOptions) {
    super();
    this.label = options?.label;
    this.autoResizeCanvas = options?.autoResizeCanvas ?? true;
  }

  async addPipelineGroups(...groups: PipelineGroup[]): Promise<void> {
    await Promise.all(
      groups.map(async (group) => {
        await group.build();
      }),
    );

    this.pipelineGroups.push(...groups);
  }

  private async runPipelineGroup(group: PipelineGroup): Promise<void> {
    const vaos = group.vertexAttributeObjects;
    const bindGroups = group.bindGroups;

    if (vaos.length === 0) {
      throw new Error("Vertex attribute object not set");
    }

    const device = await group.getDevice();

    const commandEncoder = device.createCommandEncoder();

    for (const pipeline of group.pipelines) {
      await pipeline.onBeforePass(pipeline);

      if (
        pipeline.type === "render" &&
        pipeline.gpuPipeline instanceof GPURenderPipeline
      ) {
        if (this.autoResizeCanvas) {
          await this.handleResize(pipeline, device);
        }

        const { pipelineDescriptor } = pipeline;
        const {
          context,
          clearColor,
          depthStencilEnabled,
          depthStencilTextureView,
          depthStencilAttachment,
        } = pipelineDescriptor;

        const multiSampleTextureView =
          pipelineDescriptor.multiSampleState.count > 1
            ? pipelineDescriptor.multiSampleTextureView
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
              loadOp: clearColor ? "clear" : "load",
              clearValue: clearColor,
              storeOp: "store",
            } satisfies GPURenderPassColorAttachment,
          ],
          depthStencilAttachment: undefined,
        };

        if (depthStencilEnabled && depthStencilTextureView) {
          renderPassDescriptor.depthStencilAttachment = {
            view: depthStencilTextureView,
            ...depthStencilAttachment,
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
            indexBuffer.cpuBuffer instanceof Uint32Array ? "uint32" : "uint16";
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
    }

    device.queue.submit([commandEncoder.finish()]);
  }

  private async handleResize(
    pipeline: Pipeline,
    device: GPUDevice,
  ): Promise<void> {
    const { canvas } = pipeline.pipelineDescriptor;
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

      const { pipelineDescriptor } = pipeline;
      pipelineDescriptor.configureContext();

      await pipelineDescriptor.buildMultiSampleTexture();
      await pipelineDescriptor.buildDepthStencilTexture();
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
