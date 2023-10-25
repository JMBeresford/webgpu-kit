import { type Constructor } from "../utils";
import type { WithCanvas } from "./Canvas";
import type { WithDevice } from "./Device";
import type { WithMultiSampling } from "./MultiSampling";

export interface DepthStencilComponent {
  depthStencilEnabled: boolean;
  depthStencilTexture?: GPUTexture;
  depthStencilTextureView?: GPUTextureView;
  depthStencilState: GPUDepthStencilState;
  depthStencilAttachment: Partial<GPURenderPassDepthStencilAttachment>;

  setDepthWriteEnabled: (enabled: boolean) => void;
  setDepthCompare: (compare: GPUCompareFunction) => void;
  setDepthStencilFormat: (format: GPUTextureFormat) => void;
  setStencilBack: (state: GPUStencilFaceState) => void;
  setStencilFront: (state: GPUStencilFaceState) => void;
  setDepthBias: (bias: number) => void;
  setDepthBiasSlopeScale: (scale: number) => void;
  setDepthBiasClamp: (clamp: number) => void;
  setStencilReadMask: (mask: number) => void;
  setStencilWriteMask: (mask: number) => void;
  setDepthStencilAttachment: (
    attachment: Partial<GPURenderPassDepthStencilAttachment>,
    replace?: boolean,
  ) => void;
  buildDepthStencilTexture: () => Promise<void>;
}

export type WithDepthStencil = InstanceType<
  ReturnType<typeof WithDepthStencil>
>;

export function WithDepthStencil<
  TBase extends Constructor<WithCanvas & WithDevice & WithMultiSampling>,
>(Base: TBase) {
  return class extends Base implements DepthStencilComponent {
    depthStencilEnabled = false;
    depthStencilTexture?: GPUTexture;
    depthStencilTextureView?: GPUTextureView;
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

    async buildDepthStencilTexture() {
      const device = await this.getDevice();

      if (this.depthStencilTexture !== undefined) {
        this.depthStencilTexture.destroy();
      }

      if (this.depthStencilEnabled) {
        this.depthStencilTexture = device.createTexture({
          label: "Depth stencil texture",
          size: [this.canvas.width, this.canvas.height],
          format: this.depthStencilState.format,
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
          sampleCount: this.multiSampleState.count,
        });

        this.depthStencilTextureView = this.depthStencilTexture.createView();
      }
    }
  };
}
