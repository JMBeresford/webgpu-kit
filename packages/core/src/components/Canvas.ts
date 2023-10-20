import type { Constructor } from "../utils";

export interface CanvasComponent {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  canvasFormat: GPUTextureFormat;

  setCanvas(canvas: HTMLCanvasElement): void;
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

let _canvas: HTMLCanvasElement | undefined;
let _context: GPUCanvasContext | undefined;

function defaultCanvas(): HTMLCanvasElement {
  if (_canvas) {
    return _canvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  _canvas = canvas;
  return canvas;
}

function defaultContext(): GPUCanvasContext {
  if (_context) {
    return _context;
  }
  const ctx = defaultCanvas().getContext("webgpu");
  if (!ctx) {
    throw new Error("Could not get WebGPU context");
  }
  _context = ctx;
  return ctx;
}

function defaultCanvasFormat(): GPUTextureFormat {
  try {
    return navigator.gpu.getPreferredCanvasFormat();
  } catch {
    throw new Error(`Could not get preferred canvas format`);
  }
}
