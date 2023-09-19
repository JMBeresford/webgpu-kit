export interface IBufferObject {
  readonly gpuBuffer: GPUBuffer;

  label?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  bufferOptions: GPUBufferBindingLayout;
  arrayBuffer: ArrayBuffer;

  setArrayBuffer(buffer: ArrayBuffer): void;
}

export interface IUniform extends IBufferObject {
  bufferOptions: {
    type: 'uniform';
  };
}

export interface IStorage extends IBufferObject {
  bufferOptions: {
    type: 'storage' | 'read-only-storage';
  };
}

export interface IBufferObjectBuilder {
  setLabel(label: string): this;
  setBinding(binding: number): this;
  setVisibility(visibility: GPUShaderStageFlags): this;
  setBufferOptions(options: GPUBufferBindingLayout): this;
  setArrayBuffer(buffer: ArrayBuffer): this;

  finish(device: GPUDevice): IBufferObject;
}

type BufferObjectOptions = Partial<
  Pick<
    IBufferObject,
    'label' | 'binding' | 'visibility' | 'arrayBuffer' | 'bufferOptions'
  >
>;

class BufferObjectBuilder implements IBufferObjectBuilder {
  label?: string;
  binding?: number;
  visibility?: GPUShaderStageFlags;
  bufferOptions?: GPUBufferBindingLayout;
  arrayBuffer?: ArrayBuffer;

  constructor(options: BufferObjectOptions) {
    this.label = options.label;
    this.binding = options.binding;
    this.visibility = options.visibility;
    this.bufferOptions = options.bufferOptions;
    this.arrayBuffer = options.arrayBuffer;
  }

  setLabel(label: string): this {
    this.label = label;
    return this;
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

  finish(device: GPUDevice): IBufferObject {
    if (this.binding == undefined) {
      throw new Error('Binding is not set');
    }
    if (this.visibility == undefined) {
      throw new Error('Visibility is not set');
    }
    if (this.arrayBuffer == undefined) {
      throw new Error('Array buffer is not set');
    }
    if (this.bufferOptions == undefined) {
      throw new Error('Buffer options is not set');
    }

    const usage =
      this.bufferOptions?.type === 'uniform'
        ? GPUBufferUsage.UNIFORM
        : GPUBufferUsage.STORAGE;

    const buffer = device.createBuffer({
      label: `${this.label ?? 'unlabelled'}-buffer`,
      size: this.arrayBuffer.byteLength,
      usage: usage | GPUBufferUsage.COPY_DST,
    });

    return new BufferObject(
      {
        label: this.label,
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

class BufferObject implements IBufferObject {
  private device: GPUDevice;
  readonly gpuBuffer: GPUBuffer;

  label?: string;
  binding: number;
  visibility: GPUShaderStageFlags;
  bufferOptions: GPUBufferBindingLayout;
  arrayBuffer: ArrayBuffer;

  constructor(
    options: Omit<IBufferObject, 'setArrayBuffer' | 'updateBuffer'>,
    device: GPUDevice
  ) {
    this.label = options.label;
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

export function createBufferObject(
  options: BufferObjectOptions = {}
): IBufferObjectBuilder {
  return new BufferObjectBuilder(options);
}
