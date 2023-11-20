import { WithLabel } from "./components/Label";
import { WithId } from "./components/Id";
import { WithDevice } from "./components/Device";
import { WithShader } from "./components/Shader";

const Mixins = WithShader(WithDevice(WithId(WithLabel())));
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
};

/**
 * A pipeline that runs either a render or compute operation
 */
export class Pipeline extends Mixins {
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
      this.device = options.device;
    }

    this.setShader(options.shader);
    this.workgroupSize = options.workgroupSize ?? [8, 8, undefined];
    this.workgroupCount = options.workgroupCount ?? [1, 1, undefined];

    if (options.clearColor) {
      this.clearColor = options.clearColor;
    }
  }

  async build(): Promise<void> {
    await this.buildShaderModule();
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
}
