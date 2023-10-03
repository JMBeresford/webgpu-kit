import type { PipelineGroup } from "./PipelineGroup";
import { WithLabel } from "./components/Label";

const Mixins = WithLabel();

type ExecutorOptions = {
  label?: string;
};

export class Executor extends Mixins {
  pipelineGroups: PipelineGroup[] = [];

  constructor(options: ExecutorOptions) {
    super();
    this.label = options.label;
  }

  async addPipelineGroup(group: PipelineGroup): Promise<this> {
    await group.build();
    this.pipelineGroups.push(group);

    return this;
  }

  private async runPipelineGroup(group: PipelineGroup): Promise<void> {
    const vao = group.vertexAttributeObject;
    const bindGroup = group.bindGroup;

    if (vao === undefined) {
      throw new Error("Vertex attribute object not set");
    }
    if (bindGroup === undefined) {
      throw new Error("Bind group not set");
    }

    const { context } = group;
    const device = await group.getDevice();

    const commandEncoder = device.createCommandEncoder();

    await Promise.all(
      group.pipelines.map(async (pipeline) => {
        if (vao.gpuBuffer === undefined) return;

        await pipeline.onBeforePass(pipeline);

        if (
          pipeline.type === "render" &&
          pipeline.gpuPipeline instanceof GPURenderPipeline
        ) {
          const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
              {
                view: context.getCurrentTexture().createView(),
                loadOp: pipeline.clearColor ? "clear" : "load",
                clearValue: pipeline.clearColor,
                storeOp: "store",
              } satisfies GPURenderPassColorAttachment,
            ],
            depthStencilAttachment: undefined,
          };

          if (group.depthStencilEnabled && group.depthTextureView) {
            renderPassDescriptor.depthStencilAttachment = {
              view: group.depthTextureView,
              ...group.depthStencilAttachment,
            };
          }

          const pass = commandEncoder.beginRenderPass(renderPassDescriptor);

          pass.setPipeline(pipeline.gpuPipeline);
          pass.setVertexBuffer(0, vao.gpuBuffer);
          pass.setBindGroup(0, bindGroup);
          pass.draw(vao.vertexCount, vao.instanceCount);
          pass.end();
        } else if (
          pipeline.type === "compute" &&
          pipeline.gpuPipeline instanceof GPUComputePipeline
        ) {
          const pass = commandEncoder.beginComputePass();
          pass.setPipeline(pipeline.gpuPipeline);
          pass.setBindGroup(0, bindGroup);
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

  async run(): Promise<void> {
    await Promise.all(
      this.pipelineGroups.map(async (group) => {
        await this.runPipelineGroup(group);
      }),
    );
  }
}
