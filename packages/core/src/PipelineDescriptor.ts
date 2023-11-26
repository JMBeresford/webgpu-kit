import { WithCanvas } from "./components/Canvas";
import { WithColorTarget } from "./components/ColorTarget";
import { WithDepthStencil } from "./components/DepthStencil";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithMultiSampling } from "./components/MultiSampling";
import { WithPrimitive } from "./components/Primitive";
import { WithShader } from "./components/Shader";

const components = WithDepthStencil(
  WithMultiSampling(
    WithColorTarget(
      WithPrimitive(WithShader(WithDevice(WithCanvas(WithLabel())))),
    ),
  ),
);

const toOmit = ["label", "layout"] as const;
type RenderPipelineDescriptor = Omit<
  GPURenderPipelineDescriptor,
  (typeof toOmit)[number]
>;

type ComputePipelineDescriptor = Omit<
  GPUComputePipelineDescriptor,
  (typeof toOmit)[number]
>;

/**
 * {@link PipelineDescriptor} constructor parameters
 */
export type PipelineDescriptorOptions = {
  type: "render" | "compute";
  shader: string;
  multisample?: boolean;
  depthStencil?: boolean;
  clearColor?: GPUColor;
  canvas?: HTMLCanvasElement;
};

/**
 * A GPU pipeline descriptor that is used in a {@link Pipeline}.
 */
export class PipelineDescriptor extends components {
  readonly type: "render" | "compute";
  clearColor?: GPUColor = [0, 0, 0, 1];
  multiSampleEnabled: boolean;
  depthStencilEnabled: boolean;

  constructor(opts: PipelineDescriptorOptions) {
    super();

    this.type = opts.type;
    this.multiSampleEnabled = opts.multisample ?? false;
    this.depthStencilEnabled = opts.depthStencil ?? false;

    this.setShader(opts.shader);
    if (opts.canvas) {
      this.setCanvas(opts.canvas);
    }
  }

  getRenderDescriptor(): RenderPipelineDescriptor {
    if (!this.shaderModule) {
      throw new Error("No shader module");
    }

    if (this.multiSampleEnabled) {
      this.setMultiSampleCount(4);
    } else {
      this.setMultiSampleCount(1);
    }

    return {
      multisample: this.multiSampleState,
      depthStencil: this.depthStencilEnabled
        ? this.depthStencilState
        : undefined,
      primitive: this.primitiveState,
      vertex: {
        module: this.shaderModule,
        entryPoint: this.shaderEntries.vertex ?? "vertexMain",
      },
      fragment: {
        module: this.shaderModule,
        entryPoint: this.shaderEntries.fragment ?? "fragmentMain",
        targets: [this.colorTarget],
      },
    };
  }

  getComputeDescriptor(): ComputePipelineDescriptor {
    if (!this.shaderModule) {
      throw new Error("No shader module");
    }

    return {
      compute: {
        module: this.shaderModule,
        entryPoint: this.shaderEntries.compute ?? "computeMain",
      },
    };
  }

  async build(): Promise<void> {
    await this.buildShaderModule();

    if (this.type === "render") {
      await this.buildMultiSampleTexture();
      await this.buildDepthStencilTexture();
    }
  }
}
