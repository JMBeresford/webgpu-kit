import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import type { Attribute } from "./Attribute";
import { WithCpuBuffer } from "./components/CpuBuffer";

const Mixins = WithCpuBuffer(WithGpuBuffer(WithDevice(WithLabel())));

/**
 * {@link VertexAttributeObject} constructor parameters
 */
export type VAOOptions = {
  label?: string;
  vertexCount: number;
  instanceCount?: number;
};

/**
 * A GPU vertex attribute object that is composed of multiple {@link Attribute}s
 * to be used in a {@link PipelineGroup}
 */
export class VertexAttributeObject extends Mixins {
  readonly attributes: Attribute[] = [];
  layout?: GPUVertexBufferLayout;
  vertexCount: number;
  instanceCount: number;

  constructor(options: VAOOptions) {
    super();
    this.label = options.label;
    this.instanceCount = options.instanceCount ?? 1;
    this.vertexCount = options.vertexCount;
  }

  async addAttribute(attribute: Attribute): Promise<this> {
    this.attributes.push(attribute);

    this.updateLayout();
    await this.updateBuffer();

    return this;
  }

  setInstanceCount(count: number) {
    this.instanceCount = count;
  }

  private updateLayout(): void {
    if (this.attributes.length === 0) {
      return;
    }

    let offset = 0;
    const attributes: GPUVertexAttribute[] = [];
    for (const attribute of this.attributes) {
      attributes.push({
        format: attribute.format,
        offset,
        shaderLocation: attribute.shaderLocation,
      });

      offset += attribute.itemSize * attribute.cpuBuffer.BYTES_PER_ELEMENT;
    }

    this.layout = {
      arrayStride: offset,
      attributes,
    };
  }

  private async updateBuffer(): Promise<void> {
    if (this.attributes.length === 0) {
      return;
    }

    const data: number[] = [];

    if (!this.layout) {
      throw new Error("layout is undefined");
    }

    for (let i = 0; i < this.vertexCount; i++) {
      for (const attribute of this.attributes) {
        const offset = i * attribute.itemSize;
        for (let j = offset; j < offset + attribute.itemSize; j++) {
          data.push(attribute.cpuBuffer[j]);
        }
      }
    }

    this.setCpuBuffer(new Float32Array(data));

    if (!this.cpuBuffer) {
      throw new Error("cpuBuffer is undefined");
    }

    const device = await this.getDevice();
    const size = this.cpuBuffer.byteLength;
    if (this.gpuBuffer === undefined || size !== this.gpuBuffer.size) {
      this.gpuBuffer = device.createBuffer({
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        label: `${this.label ?? "Unlabelled"} Vertex Buffer`,
        size,
      });
    }

    device.queue.writeBuffer(this.gpuBuffer, 0, this.cpuBuffer);
  }
}
