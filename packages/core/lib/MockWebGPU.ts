export const MockDevice = {
  createBuffer: () => ({}) as unknown as GPUBuffer,
  queue: {
    writeBuffer: () => {},
  },
} as unknown as GPUDevice;

export const MockCanvas = {
  getContext: () => ({}) as unknown as GPUCanvasContext,
} as unknown as HTMLCanvasElement;

export const MockContext = {
  configure: () => {},
  getSwapChainPreferredFormat: () => "rgba8unorm",
} as unknown as GPUCanvasContext;

export const MockCanvasFormat: GPUTextureFormat = "rgba8unorm";

export const MockAdapter = {} as unknown as GPUAdapter;

export const MockWebGPU: Record<string, unknown> = {
  navigator: {
    gpu: {
      getPreferredCanvasFormat: () => "rgba8unorm",
    },
  },
  // note that these values are not necessarily correct,
  // they came from github copilot and that thing is never
  // wrong

  GPUBufferUsage: {
    MAP_READ: 1,
    MAP_WRITE: 2,
    COPY_SRC: 4,
    COPY_DST: 8,
    INDEX: 16,
    VERTEX: 32,
    UNIFORM: 64,
    STORAGE: 128,
    INDIRECT: 256,
    QUERY_RESOLVE: 512,
  },
};
