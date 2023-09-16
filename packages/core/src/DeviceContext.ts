import { v4 as uuidv4 } from 'uuid';

type DeviceOptions = {
  powerPreference?: GPUPowerPreference;
  adapter?: GPUAdapter;
  device?: GPUDevice;
  canvas?: HTMLCanvasElement;
};

type DeviceContextOptions = {
  adapter: GPUAdapter;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
};

export interface IDeviceContext {
  readonly id: string;
  adapter: GPUAdapter;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  canvasCtx: GPUCanvasContext;
  canvasFormat: GPUTextureFormat;
}

class DeviceContext implements IDeviceContext {
  readonly id: string = uuidv4();
  adapter: GPUAdapter;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  canvasCtx: GPUCanvasContext;
  canvasFormat: GPUTextureFormat;

  constructor(options: DeviceContextOptions) {
    this.adapter = options.adapter;
    this.device = options.device;
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext('webgpu');

    if (!ctx) {
      throw new Error('Could not get WebGPU context');
    }

    const format = navigator.gpu!.getPreferredCanvasFormat();
    ctx.configure({
      device: this.device,
      format,
    });

    this.canvasCtx = ctx;
    this.canvasFormat = format;
  }
}

export async function deviceContext(options: DeviceOptions) {
  const adapter =
    options.adapter ??
    (await navigator.gpu?.requestAdapter({
      powerPreference: options.powerPreference,
    }));
  const device = options.device ?? (await adapter?.requestDevice());
  const canvas = options.canvas ?? document.createElement('canvas');

  if (!device || !adapter) {
    throw new Error('Could not get WebGPU device');
  }

  return new DeviceContext({ adapter, device, canvas });
}
