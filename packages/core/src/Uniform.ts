import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithCpuBuffer } from "./components/CpuBuffer";
import { type ArrayType } from "./utils";

type UniformOptions = {
  label?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  arrayBuffer?: ArrayType;
};

const Mixins = WithGpuBuffer(WithCpuBuffer(WithDevice(WithLabel())));

export class Uniform extends Mixins {
  readonly binding: number;
  readonly visibility: GPUShaderStageFlags;

  constructor(options: UniformOptions) {
    super();
    this.label = options.label;
    this.binding = options.binding;
    this.visibility = options.visibility;
    this.cpuBuffer = options.arrayBuffer;
  }

  async setBuffer(buffer: ArrayType): Promise<void> {
    this.cpuBuffer = buffer;
    await this.updateGpuBuffer();
  }

  async updateGpuBuffer() {
    if (this.cpuBuffer === undefined) {
      throw new Error("Cannot update GPU buffer without CPU buffer");
    }

    const device = await this.getDevice();
    const sizeMismatch = this.cpuBuffer.byteLength !== this.gpuBuffer?.size;

    if (this.gpuBuffer === undefined || sizeMismatch) {
      this.gpuBuffer = device.createBuffer({
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        label: `${this.label ?? "Unlabelled"} Uniform Buffer`,
        size: this.cpuBuffer.byteLength,
      });
    }

    device.queue.writeBuffer(this.gpuBuffer, 0, this.cpuBuffer);
  }
}
