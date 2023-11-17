import type { Constructor } from "../utils";
import { fallbackToEmpty, getDefaultDevice } from "../utils";
import type { WithCanvas } from "./Canvas";

export interface DeviceComponent {
  getDevice: () => Promise<GPUDevice>;
  setDevice: (d: GPUDevice) => void;
}

export type WithDevice = InstanceType<ReturnType<typeof WithDevice>>;

export function WithDevice<TBase extends Constructor<Partial<WithCanvas>>>(
  Base?: TBase,
) {
  return class extends fallbackToEmpty(Base) implements DeviceComponent {
    /** @internal */
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
      this._device = d;
      this.configureContext();
    }

    configureContext() {
      if (!this._device) {
        throw new Error("Attempted to configure context w/o device.");
      }

      if (this.context && this.canvasFormat) {
        this.context.configure({
          device: this._device,
          format: this.canvasFormat,
        });
      }
    }
  };
}
