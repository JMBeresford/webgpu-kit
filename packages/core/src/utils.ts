/**
 * @internal
 */ /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- private */
export type ConstructorArgs = any[];

/** @internal */
export type Constructor = new (
  ...args: ConstructorArgs
) => NonNullable<unknown>;

export type ArrayType =
  | Float32Array
  | Uint32Array
  | Uint16Array
  | Uint8Array
  | Uint8ClampedArray;

/** @internal */
export function fallbackToEmpty<T>(Base?: T) {
  if (Base !== undefined) {
    return Base;
  }

  return class {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- private
    constructor(..._args: ConstructorArgs) {}
  };
}

let defaultDevice: GPUDevice | undefined;

/** @internal */
export async function getDefaultDevice(): Promise<GPUDevice> {
  if (defaultDevice) return defaultDevice;

  const _adapter = await navigator.gpu.requestAdapter();
  const _device = await _adapter?.requestDevice();

  if (!_device) throw new Error("No GPU device found");

  defaultDevice = _device;
  return _device;
}

let _canvas: HTMLCanvasElement | undefined;
let _context: GPUCanvasContext | undefined;

/** @internal */
export function getDefaultCanvas(): HTMLCanvasElement {
  if (_canvas) {
    return _canvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  _canvas = canvas;
  return canvas;
}

/** @internal */
export function getDefaultContext(): GPUCanvasContext {
  if (_context) {
    return _context;
  }
  const ctx = getDefaultCanvas().getContext("webgpu");
  if (!ctx) {
    throw new Error("Could not get WebGPU context");
  }
  _context = ctx;
  return ctx;
}

/** @internal */
export function getDefaultCanvasFormat(): GPUTextureFormat {
  try {
    return navigator.gpu.getPreferredCanvasFormat();
  } catch {
    throw new Error(`Could not get preferred canvas format`);
  }
}

/** @internal */
export function getDataFromImage(image: HTMLImageElement): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("Could not get 2D context");
  }

  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
}

/** @internal */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** @internal */
export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

/** @internal */
export function mix(a: ArrayType, b: ArrayType, t: number): ArrayType {
  return a.map((v, i) => v + (b[i] - v) * t);
}

/** @internal */
export function bilinearInterpolation(
  topLeft: ArrayType,
  topRight: ArrayType,
  bottomLeft: ArrayType,
  bottomRight: ArrayType,
  t1: number,
  t2: number,
) {
  const top = mix(topLeft, topRight, t1);
  const bottom = mix(bottomLeft, bottomRight, t1);

  return mix(top, bottom, t2);
}
