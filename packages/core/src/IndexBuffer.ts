import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithCpuBuffer } from "./components/CpuBuffer";
import { WithCanvas } from "./components/Canvas";

type IndexArray = Uint16Array | Uint32Array;
const components = WithCpuBuffer(
  WithGpuBuffer(WithDevice(WithCanvas(WithLabel()))),
);

/**
 * {@link IndexBuffer} constructor parameters
 */
export type IndexBufferOptions = {
  label?: string;
  arrayBuffer: IndexArray;

  /**
   * The number of indices to draw. If not set, the length of the array buffer
   * will be used.
   */
  indexCount?: number;
  firstIndex?: number;
  baseIndex?: number;
};

/**
 * An index buffer that is used in a {@link VertexAttributeObject} to
 * direct indexed drawing operations.
 */
export class IndexBuffer extends components {
  declare cpuBuffer: IndexArray;
  indexCount?: number;
  firstIndex?: number;
  baseIndex?: number;

  constructor(options: IndexBufferOptions) {
    super();
    this.label = options.label;
    this.cpuBuffer = options.arrayBuffer;
    this.indexCount = options.indexCount;
    this.firstIndex = options.firstIndex;
    this.baseIndex = options.baseIndex;
  }

  async setCpuBuffer(indexBuffer: IndexArray) {
    this.cpuBuffer = indexBuffer;
    await this.updateGpuBuffer();
  }

  setIndexCount(indexCount: number) {
    this.indexCount = indexCount;
  }

  setFirstIndex(firstIndex: number) {
    this.firstIndex = firstIndex;
  }

  setBaseIndex(baseIndex: number) {
    this.baseIndex = baseIndex;
  }

  async updateGpuBuffer() {
    const device = await this.getDevice();
    const sizeMismatch = this.cpuBuffer.byteLength !== this.gpuBuffer?.size;

    if (this.gpuBuffer === undefined || sizeMismatch) {
      this.gpuBuffer = device.createBuffer({
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        label: `${this.label ?? "Unlabelled"} Index Buffer`,
        size: this.cpuBuffer.byteLength,
      });
    }

    device.queue.writeBuffer(this.gpuBuffer, 0, this.cpuBuffer);
  }
}
