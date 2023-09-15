type ArrayType = Float32Array | Uint32Array | Uint16Array | Uint8Array;

export interface IAttribute {
  name: string;
  format: GPUVertexFormat;
  shaderLocation: number;
  arrayBuffer: ArrayType;
  itemSize: number;
  itemCount: number;

  setArrayBuffer(buffer: ArrayType): void;
}

export interface IAttributeBuilder {
  setName(name: string): this;
  setFormat(format: GPUVertexFormat): this;
  setShaderLocation(location: number): this;
  setArrayBuffer(buffer: ArrayType): this;
  setItemSize(size: number): this;
  setItemCount(count: number): this;

  finish(): IAttribute;
}

type AttributeOptions = Partial<IAttribute & { buffer: ArrayType }>;

class AttributeBuilder implements IAttributeBuilder {
  name?: string;
  format?: GPUVertexFormat;
  shaderLocation?: number;
  arrayBuffer?: ArrayType;
  itemSize?: number;
  itemCount?: number;

  constructor(options: AttributeOptions = {}) {
    this.name = options.name;
    this.format = options.format;
    this.shaderLocation = options.shaderLocation;
    this.arrayBuffer = options.arrayBuffer;
    this.itemSize = options.itemSize;
    this.itemCount = options.itemCount;
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setFormat(format: GPUVertexFormat): this {
    this.format = format;
    return this;
  }

  setShaderLocation(location: number): this {
    this.shaderLocation = location;
    return this;
  }

  setArrayBuffer(buffer: ArrayType): this {
    this.arrayBuffer = buffer;
    return this;
  }

  setItemSize(size: number): this {
    this.itemSize = size;
    return this;
  }

  setItemCount(count: number): this {
    this.itemCount = count;
    return this;
  }

  finish(): IAttribute {
    if (!this.name) {
      throw new Error('Attribute name is required');
    }
    if (!this.format) {
      throw new Error('Attribute format is required');
    }
    if (this.shaderLocation == undefined) {
      throw new Error('Attribute shader location is required');
    }
    if (!this.arrayBuffer) {
      throw new Error('Attribute buffer is required');
    }
    if (this.itemSize == undefined) {
      throw new Error('Attribute item size is required');
    }
    if (this.itemCount == undefined) {
      throw new Error('Attribute item count is required');
    }

    return new Attribute({
      name: this.name,
      format: this.format,
      shaderLocation: this.shaderLocation,
      arrayBuffer: this.arrayBuffer,
      itemSize: this.itemSize,
      itemCount: this.itemCount,
    });
  }
}

class Attribute implements IAttribute {
  name: string;
  format: GPUVertexFormat;
  shaderLocation: number;
  arrayBuffer: ArrayType;
  itemSize: number;
  itemCount: number;

  constructor(options: Omit<IAttribute, 'setArrayBuffer' | 'updateBuffer'>) {
    this.name = options.name;
    this.format = options.format;
    this.shaderLocation = options.shaderLocation;
    this.arrayBuffer = options.arrayBuffer;
    this.itemSize = options.itemSize;
    this.itemCount = options.itemCount;
  }

  setArrayBuffer(buffer: ArrayType): void {
    this.arrayBuffer = buffer;
  }
}

export function createAttribute(
  options: AttributeOptions = {}
): IAttributeBuilder {
  return new AttributeBuilder(options);
}
