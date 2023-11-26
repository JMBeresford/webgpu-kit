import { WithLabel } from "./components/Label";
import { PipelineDescriptor } from "./PipelineDescriptor";

const components = WithLabel();
export type PipelineCallback = (pipeline: Pipeline) => void | Promise<void>;

type WorkgroupSize = [number, number | undefined, number | undefined];
type WorkgroupCount = [number, number | undefined, number | undefined];

/**
 * {@link Pipeline} constructor parameters
 */
export type PipelineOptions = {
  label?: string;
  type?: "render" | "compute";

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

  /**
   * The size of the workgroup to run a compute shader with
   */
  workgroupSize?: WorkgroupSize;

  /**
   * The number of workgroups to run a compute shader with
   */
  workgroupCount?: WorkgroupCount;

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
};

/**
 * A pipeline that runs either a render or compute operation
 */
export class Pipeline extends components {
  readonly type: "render" | "compute" = "render";
  onBeforePass: PipelineCallback = () => {};
  onAfterPass: PipelineCallback = () => {};
  gpuPipeline?: GPURenderPipeline | GPUComputePipeline;
  workgroupSize: WorkgroupSize;
  workgroupCount: WorkgroupCount;
  pipelineDescriptor: PipelineDescriptor;

  constructor(options: PipelineOptions) {
    super();
    this.label = options.label;
    this.type = options.type ?? "render";
    this.onBeforePass = options.onBeforePass ?? this.onBeforePass;
    this.onAfterPass = options.onAfterPass ?? this.onAfterPass;

    this.workgroupSize = options.workgroupSize ?? [8, 8, undefined];
    this.workgroupCount = options.workgroupCount ?? [1, 1, undefined];

    this.pipelineDescriptor = new PipelineDescriptor({
      type: this.type,
      shader: options.shader,
      clearColor: options.clearColor,
      multisample: options.enableMultiSampling,
      depthStencil: options.enableDepthStencil,
      canvas: options.canvas,
    });
  }

  async build(): Promise<void> {
    await this.pipelineDescriptor.build();
  }

  setWorkgroupSize(size: WorkgroupSize): void {
    this.workgroupSize = size;
  }

  setWorkgroupCount(count: WorkgroupCount): void {
    this.workgroupCount = count;
  }

  setOnBeforePass(f: PipelineCallback): void {
    this.onBeforePass = f;
  }

  setOnAfterPass(f: PipelineCallback): void {
    this.onAfterPass = f;
  }

  setClearColor(color: GPUColor): void {
    this.pipelineDescriptor.clearColor = color;
  }

  getRenderDescriptor(
    buffers: GPUVertexBufferLayout[],
    layout: GPUPipelineLayout,
  ): GPURenderPipelineDescriptor {
    if (this.type !== "render") {
      throw new Error("Pipeline is not a render pipeline");
    }

    const renderDescriptor: GPURenderPipelineDescriptor = {
      label: `${this.label ?? "Unlabelled"} Render Pipeline`,
      layout,
      ...this.pipelineDescriptor.getRenderDescriptor(),
    };

    renderDescriptor.vertex.buffers = buffers;

    return renderDescriptor;
  }

  getComputeDescriptor(
    layout: GPUPipelineLayout,
  ): GPUComputePipelineDescriptor {
    if (this.type !== "compute") {
      throw new Error("Pipeline is not a compute pipeline");
    }

    return {
      label: `${this.label ?? "Unlabelled"} Compute Pipeline`,
      layout,
      ...this.pipelineDescriptor.getComputeDescriptor(),
    };
  }
}
