import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithCpuBuffer } from "./components/CpuBuffer";
import { type ArrayType } from "./utils";

type StorageOptions = {
  label?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  readOnly?: boolean;
  arrayBuffer?: ArrayType;
};

const Mixins = WithGpuBuffer(WithCpuBuffer(WithDevice(WithLabel())));

export class Storage extends Mixins {
  readonly binding: number;
  readonly visibility: GPUShaderStageFlags;
  readonly bufferOptions: {
    type: "storage" | "read-only-storage";
  };

  constructor(options: StorageOptions) {
    super();
    this.label = options.label;
    this.binding = options.binding;
    this.visibility = options.visibility;
    this.cpuBuffer = options.arrayBuffer;

    this.bufferOptions = {
      type: options.readOnly === false ? "storage" : "read-only-storage",
    };
  }

  async setBuffer(buffer: ArrayType): Promise<void> {
    this.cpuBuffer = buffer;
    await this.updateGpuBuffer();
  }

  async updateGpuBuffer() {
    if (this.cpuBuffer === undefined) {
      throw new Error("Cannot update GPU buffer without CPU buffer");
    }

    const sizeMismatch = this.cpuBuffer.byteLength !== this.gpuBuffer?.size;
    const device = await this.getDevice();

    if (this.gpuBuffer === undefined || sizeMismatch) {
      this.gpuBuffer = device.createBuffer({
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        label: `${this.label ?? "Unlabelled"} Storage Buffer`,
        size: this.cpuBuffer.byteLength,
      });
    }

    device.queue.writeBuffer(this.gpuBuffer, 0, this.cpuBuffer);
  }
}
