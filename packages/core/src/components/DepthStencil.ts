import { fallbackToEmpty, type Constructor } from "../utils";

export type WithDepthStencil = InstanceType<
  ReturnType<typeof WithDepthStencil>
>;

export function WithDepthStencil<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) {
    depthStencilEnabled = false;
    depthStencilState: GPUDepthStencilState = {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus-stencil8",
      stencilBack: {
        compare: "always",
        failOp: "keep",
        depthFailOp: "keep",
        passOp: "keep",
      },
      stencilFront: {
        compare: "always",
        failOp: "keep",
        depthFailOp: "keep",
        passOp: "keep",
      },
      depthBias: 0,
      depthBiasSlopeScale: 0,
      depthBiasClamp: 0,
      stencilReadMask: 0xff,
      stencilWriteMask: 0xff,
    };

    depthStencilAttachment: Partial<GPURenderPassDepthStencilAttachment> = {
      depthLoadOp: "clear",
      depthStoreOp: "store",
      stencilLoadOp: "clear",
      stencilStoreOp: "store",
      depthClearValue: 1.0,
      stencilClearValue: 0,
    };

    setDepthWriteEnabled(enabled: boolean): void {
      this.depthStencilState.depthWriteEnabled = enabled;
    }

    setDepthCompare(compare: GPUCompareFunction): void {
      this.depthStencilState.depthCompare = compare;
    }

    setDepthStencilFormat(format: GPUTextureFormat): void {
      this.depthStencilState.format = format;
    }

    setStencilBack(state: GPUStencilFaceState): void {
      this.depthStencilState.stencilBack = state;
    }

    setStencilFront(state: GPUStencilFaceState): void {
      this.depthStencilState.stencilFront = state;
    }

    setDepthBias(bias: number): void {
      this.depthStencilState.depthBias = bias;
    }

    setDepthBiasSlopeScale(scale: number): void {
      this.depthStencilState.depthBiasSlopeScale = scale;
    }

    setDepthBiasClamp(clamp: number): void {
      this.depthStencilState.depthBiasClamp = clamp;
    }

    setStencilReadMask(mask: number): void {
      this.depthStencilState.stencilReadMask = mask;
    }

    setStencilWriteMask(mask: number): void {
      this.depthStencilState.stencilWriteMask = mask;
    }

    setDepthStencilAttachment(
      attachment: Partial<GPURenderPassDepthStencilAttachment>,
      replace = true,
    ): void {
      if (replace) {
        this.depthStencilAttachment = attachment;
      } else {
        Object.assign(this.depthStencilAttachment, attachment);
      }
    }
  };
}
