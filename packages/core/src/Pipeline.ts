import { WithLabel } from "./components/Label";
import { WithId } from "./components/Id";
import { WithDevice } from "./components/Device";
import { WithShader } from "./components/Shader";

const Mixins = WithShader(WithDevice(WithId(WithLabel())));
export type PipelineCallback = (pipeline: Pipeline) => void | Promise<void>;

/**
 * {@link Pipeline} constructor parameters
 */
export type PipelineOptions = {
  label?: string;
  type?: "render" | "compute";
  onBeforePass?: PipelineCallback;
  onAfterPass?: PipelineCallback;
  device?: GPUDevice;
  shader: string;
  workgroupSize?: [number, number, number];
  workgroupCount?: [number, number, number];
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
  workgroupSize: [number, number, number];
  workgroupCount: [number, number, number];
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
    this.workgroupSize = options.workgroupSize ?? [64, 64, 64];
    this.workgroupCount = options.workgroupCount ?? [8, 8, 8];

    if (options.clearColor) {
      this.clearColor = options.clearColor;
    }
  }

  async build(): Promise<void> {
    await this.buildShaderModule();
  }

  setWorkgroupSize(size: [number, number, number]): void {
    this.workgroupSize = size;
  }

  setWorkgroupCount(count: [number, number, number]): void {
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
