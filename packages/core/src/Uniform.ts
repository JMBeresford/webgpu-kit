import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import { WithCpuBuffer } from "./components/CpuBuffer";
import { type ArrayType } from "./utils";
import { WithCanvas } from "./components/Canvas";

/**
 * {@link Uniform} constructor parameters
 */
export type UniformOptions = {
  label?: string;

  /**
   * The binding number of the uniform object in the {@link BindGroup}.
   */
  binding: number;

  /**
   * The shader stages that this uniform is visible to.
   * e.g. GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT would make the uniform
   * visible to both the vertex and fragment shaders.
   */
  visibility: GPUShaderStageFlags;
  arrayBuffer?: ArrayType;
};

const Mixins = WithGpuBuffer(
  WithCpuBuffer(WithDevice(WithCanvas(WithLabel()))),
);

/**
 * A GPU uniform object that can be used in a {@link BindGroup}.
 */
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

  async setCpuBuffer(buffer: ArrayType): Promise<void> {
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
