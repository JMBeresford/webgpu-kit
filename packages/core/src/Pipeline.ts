import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import {
  ComputePipelineDescriptor,
  RenderPipelineDescriptor,
} from "./PipelineDescriptor";

const components = WithDevice(WithLabel());
export type Pipeline = RenderPipeline | ComputePipeline;
export type PipelineCallback = (pipeline: Pipeline) => void | Promise<void>;

type WorkgroupSize = [number, number | undefined, number | undefined];
type WorkgroupCount = [number, number | undefined, number | undefined];

/**
 * {@link BasePipeline} constructor parameters
 */
type PipelineOptions = {
  label?: string;

  /**
   * The callback to run before each pass of the pipeline
   */
  onBeforePass?: PipelineCallback;

  /**
   * The callback to run after each pass of the pipeline
   */
  onAfterPass?: PipelineCallback;
  device?: GPUDevice;
  shader: string;
};

export type RenderPipelineOptions = {
  /**
   * The color to clear the screen with before running a render shader.
   * Defaults to [0, 0, 0, 1] (black).
   */
  clearColor?: GPUColor;

  /**
   * The canvas to render to. If not set, the canvas from the {@link Canvas} component will be used.
   */
  canvas?: HTMLCanvasElement;
  enableMultiSampling?: boolean;
  enableDepthStencil?: boolean;
} & PipelineOptions;

export type ComputePipelineOptions = {
  /**
   * The size of the workgroup to run a compute shader with
   */
  workgroupSize?: WorkgroupSize;

  /**
   * The number of workgroups to run a compute shader with
   */
  workgroupCount?: WorkgroupCount;
} & PipelineOptions;

export class RenderPipeline extends components {
  gpuPipeline?: GPURenderPipeline;
  pipelineDescriptor: RenderPipelineDescriptor;
  onBeforePass: PipelineCallback = () => {};
  onAfterPass: PipelineCallback = () => {};
  clearColor?: GPUColor = [0, 0, 0, 1];

  constructor(options: RenderPipelineOptions) {
    super();

    this.label = options.label;
    if (options.onBeforePass) {
      this.setOnBeforePass(options.onBeforePass);
    }

    if (options.onAfterPass) {
      this.setOnAfterPass(options.onAfterPass);
    }

    if (options.clearColor) {
      this.setClearColor(options.clearColor);
    }

    this.pipelineDescriptor = new RenderPipelineDescriptor({
      shader: options.shader,
      multisample: options.enableMultiSampling,
      depthStencil: options.enableDepthStencil,
      canvas: options.canvas,
    });
  }

  setClearColor(color?: GPUColor): void {
    this.clearColor = color;
  }

  async build(
    layout: GPUPipelineLayout,
    buffers: GPUVertexBufferLayout[],
  ): Promise<void> {
    await this.pipelineDescriptor.build(layout, buffers);

    const { context, canvasFormat } = this.pipelineDescriptor;
    const device = await this.getDevice();

    if (!context) {
      throw new Error("Pipeline context not set");
    }

    context.configure({
      device,
      format: canvasFormat,
    });

    if (!this.pipelineDescriptor.descriptor) {
      throw new Error("Pipeline descriptor not set");
    }

    this.gpuPipeline = device.createRenderPipeline(
      this.pipelineDescriptor.descriptor,
    );
  }

  setOnBeforePass(f: PipelineCallback): void {
    this.onBeforePass = f;
  }

  setOnAfterPass(f: PipelineCallback): void {
    this.onAfterPass = f;
  }
}

export class ComputePipeline extends components {
  gpuPipeline?: GPUComputePipeline;
  pipelineDescriptor: ComputePipelineDescriptor;
  workgroupSize: WorkgroupSize;
  workgroupCount: WorkgroupCount;
  onBeforePass: PipelineCallback = () => {};
  onAfterPass: PipelineCallback = () => {};

  constructor(options: ComputePipelineOptions) {
    super();

    this.workgroupSize = options.workgroupSize ?? [8, 8, undefined];
    this.workgroupCount = options.workgroupCount ?? [1, 1, undefined];

    this.pipelineDescriptor = new ComputePipelineDescriptor({
      shader: options.shader,
    });

    if (options.onBeforePass) {
      this.setOnBeforePass(options.onBeforePass);
    }

    if (options.onAfterPass) {
      this.setOnAfterPass(options.onAfterPass);
    }
  }

  async build(layout: GPUPipelineLayout): Promise<void> {
    await this.pipelineDescriptor.build(layout);

    if (!this.pipelineDescriptor.descriptor) {
      throw new Error("Pipeline descriptor not set");
    }

    const device = await this.getDevice();
    this.gpuPipeline = device.createComputePipeline(
      this.pipelineDescriptor.descriptor,
    );
  }

  setOnBeforePass(f: PipelineCallback): void {
    this.onBeforePass = f;
  }

  setOnAfterPass(f: PipelineCallback): void {
    this.onAfterPass = f;
  }

  setWorkgroupSize(size: WorkgroupSize): void {
    this.workgroupSize = size;
  }

  setWorkgroupCount(count: WorkgroupCount): void {
    this.workgroupCount = count;
  }
}
