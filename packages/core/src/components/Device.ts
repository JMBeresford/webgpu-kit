import type { Constructor } from "../utils";
import { fallbackToEmpty, getDefaultDevice } from "../utils";
import type { WithCanvas } from "./Canvas";

export type WithDevice = InstanceType<ReturnType<typeof WithDevice>>;

export function WithDevice<TBase extends Constructor<Partial<WithCanvas>>>(
  Base?: TBase,
) {
  return class extends fallbackToEmpty(Base) {
    _device?: GPUDevice;

    async getDevice(): Promise<GPUDevice> {
      if (!this._device) {
        const d = await getDefaultDevice();
        this.setDevice(d);
        return d;
      }

      return this._device;
    }

    setDevice(d: GPUDevice): void {
      this.device = d;

      if (this.context && this.canvasFormat) {
        this.context.configure({
          device: d,
          format: this.canvasFormat,
        });
      }
    }
  };
}
