import { WithCanvas } from "./Canvas";
import { WithLabel } from "./Label";

const components = WithCanvas(WithLabel());

export function WithColorTarget<TBase extends typeof components>(Base: TBase) {
  return class extends Base {
    colorTarget: GPUColorTargetState = {
      format: this.canvasFormat,
      blend: {
        color: {
          srcFactor: "src-alpha",
          dstFactor: "one-minus-src-alpha",
          operation: "add",
        },
        alpha: {
          srcFactor: "src-alpha",
          dstFactor: "one-minus-src-alpha",
          operation: "add",
        },
      },
      writeMask: GPUColorWrite.ALL,
    };
  };
}
