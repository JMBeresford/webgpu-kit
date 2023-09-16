import { IDeviceContext } from '../DeviceContext';
import { IPipelineUnit } from './PipelineUnit';
import { PipelineGroupBaseState, PipelineGroupState } from './PipelineState';
import { IAttribute } from '../Attribute';
import { IUniform } from '../Uniform';
import { IStorage } from '../Storage';

type PipelineGroupOptions<T> = {
  deviceCtx: IDeviceContext;
  label?: string;
  initialState?: T;
};

type PipelineGroupCommon<T> = {
  label?: string;
  deviceCtx: IDeviceContext;
  state: PipelineGroupState<T>;
  pipelineLayout?: GPUPipelineLayout;
  bindGroupLayout?: GPUBindGroupLayout;
  bindGroupCount?: number;
  vertexBuffer?: GPUBuffer;
  pipelineUnits: IPipelineUnit<T>[];
  attributes: IAttribute[];
  uniforms: IUniform[];
  storageUnits: IStorage[];
};

export interface IPipelineGroupBuilder<T> extends PipelineGroupCommon<T> {
  bindGroups: GPUBindGroup[];
  addPipeline(pass: IPipelineUnit<T>): this;
  addAttribute(attr: IAttribute): this;
  addUniform(uniform: IUniform): this;
  addStorage(storage: IStorage): this;
  setBindGroupCount(count: number): this;
  setBindGroupEntries(bindGroups: GPUBindGroupEntry[][]): this;
  finish(): Promise<IPipelineGroup<T>>;
}

export interface IPipelineGroup<T = PipelineGroupBaseState>
  extends PipelineGroupCommon<T> {}

class PipelineGroupBuilder<T> implements IPipelineGroupBuilder<T> {
  label?: string;
  pipelineUnits: IPipelineUnit<T>[] = [];
  deviceCtx: IDeviceContext;
  state: PipelineGroupState<T>;
  bindGroupLayout?: GPUBindGroupLayout;
  pipelineLayout?: GPUPipelineLayout;
  bindGroups: GPUBindGroup[] = [];
  bindGroupEntries: GPUBindGroupEntry[][] = [];
  bindGroupCount?: number;
  vertexBuffer?: GPUBuffer;
  attributes: IAttribute[] = [];
  uniforms: IUniform[] = [];
  storageUnits: IStorage[] = [];

  constructor(options: PipelineGroupOptions<T>) {
    this.deviceCtx = options.deviceCtx;
    this.label = options.label;
    this.state = (options.initialState ?? {}) as PipelineGroupState<T>;
  }

  addPipeline(pass: IPipelineUnit<T>): this {
    this.pipelineUnits.push(pass);
    return this;
  }

  addAttribute(attr: IAttribute): this {
    this.attributes.push(attr);
    return this;
  }

  addUniform(uniform: IUniform): this {
    this.uniforms.push(uniform);
    return this;
  }

  addStorage(storage: IStorage): this {
    this.storageUnits.push(storage);
    return this;
  }

  setBindGroupCount(count: number): this {
    this.bindGroupCount = count;
    return this;
  }

  setBindGroupEntries(bindGroups: GPUBindGroupEntry[][]): this {
    this.bindGroupEntries = bindGroups;
    return this;
  }

  private buildVertexAttributeBuffer(): void {
    const vertexAttributeBuffer = this.deviceCtx.device.createBuffer({
      size: this.attributes.reduce(
        (acc, attribute) => acc + attribute.arrayBuffer.byteLength,
        0
      ),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const array: number[] = [];
    for (const attr of this.attributes) {
      attr.arrayBuffer.forEach((value) => array.push(value));
    }

    this.deviceCtx.device.queue.writeBuffer(
      vertexAttributeBuffer,
      0,
      new Float32Array(array)
    );

    this.vertexBuffer = vertexAttributeBuffer;
  }

  private buildLayouts(): void {
    const device = this.deviceCtx.device;
    const label = `${this.label ?? 'Unlabeled'} PipelineGroupBindGroupLayout`;
    const entries: GPUBindGroupLayoutEntry[] = [];

    for (const uniform of this.uniforms) {
      entries.push({
        binding: uniform.binding,
        visibility: uniform.visibility,
        buffer: uniform.bufferOptions,
      });
    }

    for (const storage of this.storageUnits) {
      entries.push({
        binding: storage.binding,
        visibility: storage.visibility,
        buffer: storage.bufferOptions,
      });
    }

    this.bindGroupLayout = device.createBindGroupLayout({ label, entries });
    this.pipelineLayout = device.createPipelineLayout({
      label: `${this.label ?? 'Unlabeled'} PipelineLayout`,
      bindGroupLayouts: [this.bindGroupLayout],
    });
  }

  private buildPipelines(): void {
    if (!this.bindGroupLayout || !this.pipelineLayout) {
      throw new Error('Layouts not built');
    }

    const device = this.deviceCtx.device;
    const arrayStride = this.attributes.reduce(
      (acc, attribute) => acc + attribute.itemSize * attribute.itemCount,
      0
    );

    let offset = 0;
    const attributes: GPUVertexAttribute[] = [];
    for (const attribute of this.attributes) {
      attributes.push({
        format: attribute.format,
        offset,
        shaderLocation: attribute.shaderLocation,
      });

      offset += attribute.arrayBuffer.byteLength;
    }

    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride,
      attributes,
    };

    for (const unit of this.pipelineUnits) {
      const shaderModule = device.createShaderModule({
        code: unit.shader,
      });

      if (unit.type === 'compute') {
        unit.pipeline = device.createComputePipeline({
          label: `${unit.label ?? 'Unlabeled'} ComputePipeline`,
          layout: this.pipelineLayout,
          compute: {
            module: shaderModule,
            entryPoint: unit.shaderEntries?.compute ?? 'computeMain',
          },
        });
      } else {
        unit.pipeline = device.createRenderPipeline({
          label: `${unit.label ?? 'Unlabeled'} RenderPipeline`,
          layout: this.pipelineLayout,
          vertex: {
            module: shaderModule,
            entryPoint: unit.shaderEntries?.vertex ?? 'vertexMain',
            buffers: [vertexBufferLayout],
          },
          fragment: {
            module: shaderModule,
            entryPoint: unit.shaderEntries?.fragment ?? 'fragmentMain',
            targets: [
              {
                format: this.deviceCtx.canvasFormat,
              },
            ],
          },
        });
      }
    }
  }

  private buildBindGroups() {
    if (!this.bindGroupLayout) {
      throw new Error('Bind group layout not built');
    }

    const device = this.deviceCtx.device;

    const bindGroups: GPUBindGroup[] = [];
    for (let i = 0; i < (this.bindGroupCount ?? 1); i++) {
      const label = `${this.label ?? 'Unlabeled'} PipelineGroupBindGroup-${i}`;
      const entries: GPUBindGroupEntry[] = this.bindGroupEntries[i] ?? [];

      if (entries.length === 0) {
        for (const uniform of this.uniforms) {
          entries.push({
            binding: uniform.binding,
            resource: {
              buffer: uniform.gpuBuffer,
            },
          });
        }

        for (const storage of this.storageUnits) {
          entries.push({
            binding: storage.binding,
            resource: {
              buffer: storage.gpuBuffer,
            },
          });
        }
      }

      bindGroups.push(
        device.createBindGroup({
          label,
          layout: this.bindGroupLayout,
          entries: entries,
        })
      );
    }
    this.bindGroups = bindGroups;
  }

  async finish(): Promise<IPipelineGroup<T>> {
    this.buildVertexAttributeBuffer();
    this.buildLayouts();
    this.buildPipelines();
    this.buildBindGroups();

    return new PipelineGroup<T>(this);
  }
}

class PipelineGroup<T> implements IPipelineGroup<T> {
  deviceCtx: IDeviceContext;
  label?: string;
  state: PipelineGroupState<T>;
  bindGroupLayout?: GPUBindGroupLayout;
  bindGroupCount?: number;
  vertexBuffer: GPUBuffer;
  pipelineUnits: IPipelineUnit<T>[] = [];
  attributes: IAttribute[];
  uniforms: IUniform[];
  storageUnits: IStorage[];

  constructor(builder: IPipelineGroupBuilder<T>) {
    this.deviceCtx = builder.deviceCtx;
    this.label = builder.label;
    this.state = {
      ...builder.state,
      activeBindGroupIdx: 0,
      bindGroups: builder.bindGroups,
    };
    this.pipelineUnits = builder.pipelineUnits;
    this.bindGroupLayout = builder.bindGroupLayout;
    this.bindGroupCount = builder.bindGroupCount;
    this.attributes = builder.attributes;
    this.uniforms = builder.uniforms;
    this.storageUnits = builder.storageUnits;

    if (!builder.vertexBuffer) {
      throw new Error('Vertex buffer not built');
    }
    this.vertexBuffer = builder.vertexBuffer;
  }
}

export function createPipelineGroup<T = PipelineGroupBaseState>(
  options: PipelineGroupOptions<T>
): IPipelineGroupBuilder<T> {
  return new PipelineGroupBuilder(options);
}
