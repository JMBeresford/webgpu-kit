import { IPipelineGroup } from './pipelines/PipelineGroup';
import { PipelineGroupState } from './pipelines/PipelineState';
import { IPipelineUnit } from './pipelines/PipelineUnit';

export type ExecutionCallback<T> = (
  encoder: GPUCommandEncoder,
  state: PipelineGroupState<T>
) => void;

type ExecutorOptions = {
  canvas?: HTMLCanvasElement;
};

type Common = {
  canvas?: HTMLCanvasElement;
  ctx?: GPUCanvasContext;
  pipelineGroups: IPipelineGroup[];
};

export interface IExecutor extends Common {
  runPipelines(): void;
}

export interface IExecutorBuilder extends Common {
  addPipelineGroups(groups: IPipelineGroup[]): this;
  finish(): IExecutor;
}

abstract class ExecutorCommon implements Common {
  canvas?: HTMLCanvasElement;
  ctx?: GPUCanvasContext;
  pipelineGroups: IPipelineGroup[] = [];
}

class ExecutorBuilder extends ExecutorCommon implements IExecutorBuilder {
  constructor(options?: ExecutorOptions) {
    super();
    this.canvas = options?.canvas;
  }

  addPipelineGroups(groups: IPipelineGroup[]): this {
    this.pipelineGroups.push(...groups);
    return this;
  }

  finish(): IExecutor {
    return new Executor(this);
  }
}

class Executor extends ExecutorCommon implements IExecutor {
  constructor(builder: IExecutorBuilder) {
    super();
    let canvas = builder.canvas;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
    }

    this.canvas = canvas;

    const ctx = this.canvas.getContext('webgpu');
    if (!ctx) {
      throw new Error('Could not get WebGPU context');
    }

    this.ctx = ctx;
    this.pipelineGroups = builder.pipelineGroups;
  }

  runPipelines() {
    if (!this.ctx) {
      throw new Error('WebGPU context is not initialized');
    }

    for (const pipelineGroup of this.pipelineGroups) {
      const device = pipelineGroup.deviceCtx.device;
      const commandEncoder = device.createCommandEncoder();

      for (const unit of pipelineGroup.pipelineUnits) {
        if (!unit.pipeline) {
          console.error('Pipeline not built');
          continue;
        }

        unit.onBeforePass?.(pipelineGroup.state);

        if (unit.type === 'render') {
          this.runRenderPipeline(commandEncoder, pipelineGroup, unit);
        } else {
          this.runComputePipeline(commandEncoder, pipelineGroup, unit);
        }

        unit.onAfterPass?.(pipelineGroup.state);
      }

      device.queue.submit([commandEncoder.finish()]);
    }
  }

  private runRenderPipeline<T>(
    encoder: GPUCommandEncoder,
    group: IPipelineGroup<T>,
    unit: IPipelineUnit<T>
  ) {
    if (!unit.drawParams) {
      throw new Error('Draw params not set');
    }
    if (!group.vertexBuffer) {
      throw new Error('Vertex buffer not built');
    }

    const state = group.state;
    const bindGroup = state.bindGroups[state.activeBindGroupIdx];
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: group.deviceCtx.canvasCtx.getCurrentTexture().createView(),
          loadOp: 'clear',
          clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
          storeOp: 'store',
        },
      ],
    });

    pass.setPipeline(unit.pipeline as GPURenderPipeline);
    pass.setVertexBuffer(0, group.vertexBuffer);
    pass.setBindGroup(0, bindGroup);
    pass.draw(...unit.drawParams);
    pass.end();
  }

  private runComputePipeline<T>(
    encoder: GPUCommandEncoder,
    group: IPipelineGroup<T>,
    unit: IPipelineUnit<T>
  ) {
    const state = group.state;
    const bindGroup = state.bindGroups[state.activeBindGroupIdx];

    const pass = encoder.beginComputePass();
    pass.setPipeline(unit.pipeline as GPUComputePipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(...unit.dispatchParams);
    pass.end();
  }
}

export function createExecutor(options?: ExecutorOptions) {
  return new ExecutorBuilder(options);
}
