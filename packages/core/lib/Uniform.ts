export interface IUniform {
  name?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  bufferOptions?: GPUBufferBindingLayout;
  gpuBuffer: GPUBuffer;
  arrayBuffer: ArrayBuffer;

  setArrayBuffer(buffer: ArrayBuffer): void;
  updateBuffer(): void;
}

export interface IUniformBuilder {
  setBinding(binding: number): this;
  setVisibility(visibility: GPUShaderStageFlags): this;
  setBufferOptions(options: GPUBufferBindingLayout): this;
  setArrayBuffer(buffer: ArrayBuffer): this;

  finish(device: GPUDevice): IUniform;
}

type UniformOptions = Partial<IUniform & { arrayBuffer: ArrayBuffer }>;

class UniformBuilder implements IUniformBuilder {
  name?: string;
  binding?: number;
  visibility?: GPUShaderStageFlags;
  bufferOptions?: GPUBufferBindingLayout;
  arrayBuffer?: ArrayBuffer;

  constructor(options: UniformOptions = {}) {
    this.name = options.name;
    this.binding = options.binding;
    this.visibility = options.visibility;
    this.bufferOptions = options.bufferOptions ?? { type: 'uniform' };
    this.arrayBuffer = options.arrayBuffer;
  }

  setBinding(binding: number): this {
    this.binding = binding;
    return this;
  }

  setVisibility(visibility: GPUShaderStageFlags): this {
    this.visibility = visibility;
    return this;
  }

  setBufferOptions(options: GPUBufferBindingLayout): this {
    this.bufferOptions = options;
    return this;
  }

  setArrayBuffer(buffer: ArrayBuffer): this {
    this.arrayBuffer = buffer;
    return this;
  }

  finish(device: GPUDevice): IUniform {
    if (this.binding == undefined) {
      throw new Error('Binding is not set');
    }
    if (!this.visibility) {
      throw new Error('Visibility is not set');
    }
    if (!this.arrayBuffer) {
      throw new Error('Array buffer is not set');
    }

    const buffer = device.createBuffer({
      label: `${this.name ?? 'uniform'}-buffer`,
      size: this.arrayBuffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    return new Uniform(
      {
        name: this.name,
        binding: this.binding,
        visibility: this.visibility,
        bufferOptions: this.bufferOptions,
        gpuBuffer: buffer,
        arrayBuffer: this.arrayBuffer,
      },
      device
    );
  }
}

class Uniform implements IUniform {
  private device: GPUDevice;
  name?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  gpuBuffer: GPUBuffer;
  bufferOptions?: GPUBufferBindingLayout;
  arrayBuffer: ArrayBuffer;

  constructor(
    options: Omit<IUniform, 'setArrayBuffer' | 'updateBuffer'>,
    device: GPUDevice
  ) {
    this.name = options.name;
    this.binding = options.binding;
    this.visibility = options.visibility;
    this.gpuBuffer = options.gpuBuffer;
    this.bufferOptions = options.bufferOptions;
    this.device = device;
    this.arrayBuffer = options.arrayBuffer;

    this.updateBuffer();
  }

  setArrayBuffer(buffer: ArrayBuffer): void {
    this.arrayBuffer = buffer;
    this.updateBuffer();
  }

  updateBuffer(): void {
    this.device.queue.writeBuffer(this.gpuBuffer, 0, this.arrayBuffer);
  }
}

export function createUniform(options: UniformOptions = {}): IUniformBuilder {
  return new UniformBuilder(options);
}
