import type { PipelineGroup } from "./PipelineGroup";
import { RenderPipeline } from "./Pipeline";
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

      if (!pipeline.gpuPipeline) {
        throw new Error("GPU pipeline not set");
      }

      if (pipeline instanceof RenderPipeline) {
        if (this.autoResizeCanvas) {
          await this.handleResize(pipeline, device);
        }

        const { pipelineDescriptor, clearColor } = pipeline;
        const {
          context,
          depthStencilEnabled,
          depthStencilTextureView,
          depthStencilAttachment,
        } = pipelineDescriptor;

        const multiSampleTextureView =
          pipelineDescriptor.multiSampleState.count > 1
            ? pipelineDescriptor.multiSampleTextureView
            : undefined;

        if (!context) {
          throw new Error("Context not set");
        }

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

        for (let i = 0; i < vaos.length; i++) {
          const vao = vaos[i];
          if (vao.gpuBuffer === undefined) {
            throw new Error("GPU buffer not set");
          }

          pass.setVertexBuffer(i, vao.gpuBuffer);
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
      } else {
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
    pipeline: RenderPipeline,
    device: GPUDevice,
  ): Promise<void> {
    const pipelineDescriptor = pipeline.pipelineDescriptor;
    const { canvas, context, canvasFormat } = pipelineDescriptor;

    if (!canvas) {
      throw new Error("Canvas not set");
    }

    if (!context) {
      throw new Error("Context not set");
    }

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

      context.configure({
        device,
        format: canvasFormat,
      });

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
