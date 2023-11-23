import type { Constructor } from "../utils";
import type { WithCanvas } from "./Canvas";

/**
 * @internal
 */
export type ColorTargetComponent = {
  colorTarget: GPUColorTargetState;
};

/**
 * @internal
 */
export function WithColorTarget<TBase extends Constructor<WithCanvas>>(
  Base: TBase,
) {
  return class extends Base implements ColorTargetComponent {
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
