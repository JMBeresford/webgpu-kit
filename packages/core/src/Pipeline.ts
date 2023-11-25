import { WithLabel } from "./components/Label";
import { WithDevice } from "./components/Device";
import { WithShader } from "./components/Shader";
import { WithColorTarget } from "./components/ColorTarget";
import { WithCanvas } from "./components/Canvas";
import { WithMultiSampling } from "./components/MultiSampling";
import { WithDepthStencil } from "./components/DepthStencil";

const components = WithColorTarget(
  WithDepthStencil(
    WithMultiSampling(WithShader(WithDevice(WithCanvas(WithLabel())))),
  ),
);
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
  type: "render" | "compute" = "render";
  onBeforePass: PipelineCallback = () => {};
  onAfterPass: PipelineCallback = () => {};
  gpuPipeline?: GPURenderPipeline | GPUComputePipeline;
  workgroupSize: WorkgroupSize;
  workgroupCount: WorkgroupCount;
  clearColor?: GPUColor = [0, 0, 0, 1];

  constructor(options: PipelineOptions) {
    super();
    this.label = options.label;
    this.type = options.type ?? "render";
    this.onBeforePass = options.onBeforePass ?? this.onBeforePass;
    this.onAfterPass = options.onAfterPass ?? this.onAfterPass;

    if (options.device) {
      this._device = options.device;
    }

    this.setShader(options.shader);
    this.workgroupSize = options.workgroupSize ?? [8, 8, undefined];
    this.workgroupCount = options.workgroupCount ?? [1, 1, undefined];

    if (options.clearColor) {
      this.clearColor = options.clearColor;
    }

    if (options.canvas) {
      this.setCanvas(options.canvas);
    }

    if (options.enableMultiSampling) {
      this.setMultiSampleCount(4);
    }

    if (options.enableDepthStencil) {
      this.depthStencilEnabled = true;
    }
  }

  async build(): Promise<void> {
    await this.buildShaderModule();
    this.configureContext();
    await this.buildMultiSampleTexture();
    await this.buildDepthStencilTexture();
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
    this.clearColor = color;
  }

  getRenderDescriptor(
    buffers: GPUVertexBufferLayout[],
    layout: GPUPipelineLayout,
  ): GPURenderPipelineDescriptor {
    if (!this.shaderModule) {
      throw new Error("Shader module not set");
    }

    if (this.type !== "render") {
      throw new Error("Pipeline is not a render pipeline");
    }

    return {
      label: `${this.label ?? "Unlabelled"} Render Pipeline`,
      layout,
      vertex: {
        module: this.shaderModule,
        entryPoint: "vertexMain",
        buffers,
      },
      fragment: {
        module: this.shaderModule,
        entryPoint: "fragmentMain",
        targets: [this.colorTarget],
      },
      multisample: this.multiSampleState,
      depthStencil: this.depthStencilEnabled
        ? this.depthStencilState
        : undefined,
    };
  }

  getComputeDescriptor(
    layout: GPUPipelineLayout,
  ): GPUComputePipelineDescriptor {
    if (!this.shaderModule) {
      throw new Error("Shader module not set");
    }

    if (this.type !== "compute") {
      throw new Error("Pipeline is not a compute pipeline");
    }

    return {
      label: `${this.label ?? "Unlabelled"} Compute Pipeline`,
      layout,
      compute: {
        module: this.shaderModule,
        entryPoint: "computeMain",
      },
    };
  }
}
