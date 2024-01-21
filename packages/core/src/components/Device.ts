import { getDefaultDevice } from "../utils";
import { WithLabel } from "./Label";

const components = WithLabel();

export type WithDevice = typeof WithDevice;
export function WithDevice<TBase extends typeof components>(Base: TBase) {
  return class extends Base {
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
    }
  };
}
