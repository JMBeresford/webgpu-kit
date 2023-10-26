/* eslint-disable no-return-await -- mocks */
export const MockDevice = {
  createBuffer: () => ({}) as unknown as GPUBuffer,
  queue: {
    writeBuffer: () => {},
  },
} as unknown as GPUDevice;

export const MockAdapter = {} as unknown as GPUAdapter;

export const MockWebGPU: Record<string, unknown> = {
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
