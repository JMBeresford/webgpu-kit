import { WithCanvas } from "./components/Canvas";
import { WithColorTarget } from "./components/ColorTarget";
import { WithDepthStencil } from "./components/DepthStencil";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithMultiSampling } from "./components/MultiSampling";
import { WithPrimitive } from "./components/Primitive";
import { WithShader } from "./components/Shader";

const components = WithShader(WithDevice(WithLabel()));

type PipelineDescriptorOptions = {
  shader: string;
};

/**
 * {@link RenderPipelineDescriptor} constructor parameters
 */
export type RenderPipelineDescriptorOptions = {
  multisample?: boolean;
  depthStencil?: boolean;
  canvas?: HTMLCanvasElement;
} & PipelineDescriptorOptions;

/**
 * {@link ComputePipelineDescriptor} constructor parameters
 */
export type ComputePipelineDescriptorOptions = PipelineDescriptorOptions;

const renderComponents = WithDepthStencil(
  WithMultiSampling(WithColorTarget(WithPrimitive(WithCanvas(components)))),
);

/**
 * A GPU render pipeline descriptor that is used in a {@link RenderPipeline}.
 */
export class RenderPipelineDescriptor extends renderComponents {
  descriptor?: GPURenderPipelineDescriptor;
  multiSampleEnabled: boolean;
  depthStencilEnabled: boolean;

  constructor(opts: RenderPipelineDescriptorOptions) {
    super(opts);

    this.multiSampleEnabled = opts.multisample ?? false;
    this.depthStencilEnabled = opts.depthStencil ?? false;

    this.setShader(opts.shader);
    if (opts.canvas) {
      this.setCanvas(opts.canvas);
    }
  }

  async build(
    layout: GPUPipelineLayout,
    buffers: GPUVertexBufferLayout[],
  ): Promise<void> {
    await this.buildShaderModule();

    if (this.multiSampleEnabled) {
      this.setMultiSampleCount(4);
    } else {
      this.setMultiSampleCount(1);
    }

    await this.buildMultiSampleTexture();
    await this.buildDepthStencilTexture();

    if (!this.shaderModule) {
      throw new Error("No shader module");
    }

    this.descriptor = {
      label: this.label ?? "Unlabelled",
      layout,
      multisample: this.multiSampleState,
      depthStencil: this.depthStencilEnabled
        ? this.depthStencilState
        : undefined,
      primitive: this.primitiveState,
      vertex: {
        module: this.shaderModule,
        entryPoint: this.shaderEntries.vertex,
        buffers,
      },
      fragment: {
        module: this.shaderModule,
        entryPoint: this.shaderEntries.fragment,
        targets: [this.colorTarget],
      },
    };
  }
}

/**
 * A GPU compute pipeline descriptor that is used in a {@link ComputePipeline}.
 */
export class ComputePipelineDescriptor extends components {
  declare descriptor?: GPUComputePipelineDescriptor;

  constructor(opts: ComputePipelineDescriptorOptions) {
    super();
    this.setShader(opts.shader);
  }

  async build(layout: GPUPipelineLayout): Promise<void> {
    await this.buildShaderModule();

    if (!this.shaderModule) {
      throw new Error("No shader module");
    }

    this.descriptor = {
      label: this.label ?? "Unlabelled",
      layout,
      compute: {
        module: this.shaderModule,
        entryPoint: this.shaderEntries.compute,
      },
    };
  }
}
