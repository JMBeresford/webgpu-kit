import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithCpuBuffer } from "./components/CpuBuffer";

type IndexArray = Uint16Array | Uint32Array;
const Mixins = WithCpuBuffer(WithGpuBuffer(WithDevice(WithLabel())));

/**
 * {@link IndexBuffer} constructor parameters
 */
export type IndexBufferOptions = {
  label?: string;
  arrayBuffer: IndexArray;
  indexCount?: number;
  firstIndex?: number;
  baseIndex?: number;
};

/**
 * An index buffer that is used in a {@link VertexAttributeObject} to
 * use indexed drawing.
 */
export class IndexBuffer extends Mixins {
  declare cpuBuffer: IndexArray;
  indexCount?: number;
  firstIndex?: number;
  baseIndex?: number;

  constructor(options: IndexBufferOptions) {
    super();
    this.label = options.label;
    this.setCpuBuffer(options.arrayBuffer);
    this.indexCount = options.indexCount;
    this.firstIndex = options.firstIndex;
    this.baseIndex = options.baseIndex;
  }

  setCpuBuffer(indexBuffer: IndexArray) {
    this.cpuBuffer = indexBuffer;
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
