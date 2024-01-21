import type { Constructor } from "../utils";

export function WithCanvas<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    canvas?: HTMLCanvasElement;
    context?: GPUCanvasContext;
    canvasFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();

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
