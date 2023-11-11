import type { Constructor } from "../utils";
import { defaultCanvas, defaultContext, defaultCanvasFormat } from "../utils";

export interface CanvasComponent {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  canvasFormat: GPUTextureFormat;

  setCanvas: (canvas: HTMLCanvasElement) => void;
}
export type WithCanvas = InstanceType<ReturnType<typeof WithCanvas>>;

export function WithCanvas<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements CanvasComponent {
    canvas: HTMLCanvasElement = defaultCanvas();
    context: GPUCanvasContext = defaultContext();
    canvasFormat: GPUTextureFormat = defaultCanvasFormat();

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
