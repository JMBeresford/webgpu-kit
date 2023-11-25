import type { Constructor } from "../utils";
import {
  getDefaultCanvas,
  getDefaultContext,
  getDefaultCanvasFormat,
} from "../utils";

export function WithCanvas<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    canvas: HTMLCanvasElement = getDefaultCanvas();
    context: GPUCanvasContext = getDefaultContext();
    canvasFormat: GPUTextureFormat = getDefaultCanvasFormat();

    setCanvas(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      const ctx = this.canvas.getContext("webgpu");

      if (!ctx) {
        throw new Error("Could not get WebGPU context");
      }

      this.context = ctx;
    }
  };
}
