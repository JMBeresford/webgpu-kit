import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithCpuBuffer } from "./components/CpuBuffer";
import { type ArrayType } from "./utils";
import { WithCanvas } from "./components/Canvas";

/**
 * {@link Storage} constructor parameters
 */
export type StorageOptions = {
  label?: string;

  /**
   * The binding number of the storage object in the {@link BindGroup}.
   */
  binding: number;

  /**
   * The shader stages that this uniform is visible to.
   * e.g. GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT would make the uniform
   * visible to both the vertex and fragment shaders.
   */
  visibility: GPUShaderStageFlags;
  readOnly?: boolean;
  arrayBuffer: ArrayType;
};

const components = WithGpuBuffer(
  WithCpuBuffer(WithDevice(WithCanvas(WithLabel()))),
);

/**
 * A GPU storage object that can be used in a {@link BindGroup}.
 */
export class Storage extends components {
  binding: number;
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

  async setCpuBuffer(buffer: ArrayType): Promise<void> {
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
