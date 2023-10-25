import { type Constructor } from "../utils";
import type { WithCanvas } from "./Canvas";
import type { WithDevice } from "./Device";

export interface MultiSamplingComponent {
  multiSampleTexture?: GPUTexture;
  multiSampleTextureView?: GPUTextureView;
  multiSampleState: Required<GPUMultisampleState>;

  setMultiSampleCount: (count: 1 | 4) => void;
  setMultiSampleMask: (mask: number) => void;
  setMultiSampleAlphaToCoverageEnabled: (enabled: boolean) => void;
  buildMultiSampleTexture: () => Promise<void>;
}

export type WithMultiSampling = InstanceType<
  ReturnType<typeof WithMultiSampling>
>;

export function WithMultiSampling<
  TBase extends Constructor<WithDevice & WithCanvas>,
>(Base: TBase) {
  return class extends Base implements MultiSamplingComponent {
    multiSampleTexture?: GPUTexture;
    multiSampleTextureView?: GPUTextureView;
    multiSampleState: Required<GPUMultisampleState> = {
      count: 1,
      mask: 0xffffffff,
      alphaToCoverageEnabled: false,
    };

    setMultiSampleCount(count: 1 | 4): void {
      this.multiSampleState.count = count;
    }

    setMultiSampleMask(mask: number): void {
      this.multiSampleState.mask = mask;
    }

    setMultiSampleAlphaToCoverageEnabled(enabled: boolean): void {
      if (this.multiSampleState.count === 1) return;

      this.multiSampleState.alphaToCoverageEnabled = enabled;
    }

    async buildMultiSampleTexture() {
      const device = await this.getDevice();

      if (this.multiSampleTexture !== undefined) {
        this.multiSampleTexture.destroy();
      }

      if (this.multiSampleState.count > 1) {
        this.multiSampleTexture = device.createTexture({
          label: "Multi-sample texture",
          size: [this.canvas.width, this.canvas.height],
          format: this.canvasFormat,
          sampleCount: this.multiSampleState.count,
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.multiSampleTextureView = this.multiSampleTexture.createView();
      }
    }
  };
}
