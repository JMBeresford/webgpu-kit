import { WithCanvas } from "./Canvas";
import { WithDevice } from "./Device";
import { WithLabel } from "./Label";

const components = WithDevice(WithCanvas(WithLabel()));

export function WithMultiSampling<TBase extends typeof components>(
  Base: TBase,
) {
  return class extends Base {
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
