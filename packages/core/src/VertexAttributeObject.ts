import { WithGpuBuffer } from "./components/GpuBufferObject";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import type { Attribute } from ".";

const Mixins = WithGpuBuffer(WithDevice(WithLabel()));

type VAOOptions = {
  label?: string;
  vertexCount: number;
  instanceCount?: number;
};

export class VertexAttributeObject extends Mixins {
  private attributes: Attribute[] = [];
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

    let arrayStride = 0;
    let offset = 0;
    const attributes: GPUVertexAttribute[] = [];
    for (const attribute of this.attributes) {
      attributes.push({
        format: attribute.format,
        offset,
        shaderLocation: attribute.shaderLocation,
      });

      offset += attribute.cpuBuffer.byteLength;
      arrayStride += attribute.itemSize * attribute.cpuBuffer.BYTES_PER_ELEMENT;
    }

    this.layout = {
      arrayStride,
      attributes,
    };
  }

  private async updateBuffer(): Promise<void> {
    if (this.attributes.length === 0) {
      return;
    }

    let size = 0;
    const arrayBuffer: number[] = [];

    for (const attribute of this.attributes) {
      size += attribute.cpuBuffer.byteLength;
      for (const value of attribute.cpuBuffer) {
        arrayBuffer.push(value);
      }
    }

    const device = await this.getDevice();

    if (this.gpuBuffer === undefined || size !== this.gpuBuffer.size) {
      this.gpuBuffer = device.createBuffer({
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        label: `${this.label ?? "Unlabelled"} Vertex Buffer`,
        size,
      });
    }

    device.queue.writeBuffer(this.gpuBuffer, 0, new Float32Array(arrayBuffer));
  }
}
