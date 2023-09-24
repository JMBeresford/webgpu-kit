// eslint-disable-next-line @typescript-eslint/no-explicit-any -- definition of Constructor
export type ConstructorArgs = any[];

export type Constructor<T = Record<string, unknown>> = new (
  ...args: ConstructorArgs
) => T;
export type ArrayType = Float32Array | Uint32Array | Uint16Array | Uint8Array;

export function fallbackToEmpty<T extends Constructor>(Base?: T): T {
  return Base ?? (class {} as T);
}

let defaultDevice: GPUDevice | undefined;
export async function getDefaultDevice(): Promise<GPUDevice> {
  if (defaultDevice) return defaultDevice;

  const _adapter = await navigator.gpu.requestAdapter();
  const _device = await _adapter?.requestDevice();

  if (!_device) throw new Error("No GPU device found");

  defaultDevice = _device;
  return _device;
}
