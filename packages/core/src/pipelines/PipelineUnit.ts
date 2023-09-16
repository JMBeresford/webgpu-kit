import { v4 as uuidV4 } from 'uuid';
import { IDeviceContext } from '../DeviceContext';
import { PipelineGroupBaseState, PipelineGroupState } from './PipelineState';

type PipelineType = 'render' | 'compute';
type ShaderEntries = {
  vertex?: string;
  fragment?: string;
  compute?: string;
};

type PipelineOptions = {
  deviceCtx: IDeviceContext;
  type?: PipelineType;
  label?: string;
  shader: string;
  shaderEntries?: ShaderEntries;
};

type PipelineCallback<T> = (state?: PipelineGroupState<T>) => void;
type DrawParams = Parameters<GPURenderCommandsMixin['draw']>;

export type Pipeline = GPURenderPipeline | GPUComputePipeline;
export type PipelineID = string;

export interface IPipelineUnit<T> {
  readonly id: PipelineID;
  deviceCtx: IDeviceContext;
  type: PipelineType;
  shader: string;
  label?: string;
  onBeforePass?: PipelineCallback<T>;
  onAfterPass?: PipelineCallback<T>;
  drawParams?: DrawParams;
  workgroupSize: [number, number, number];
  pipeline?: Pipeline;
  shaderEntries?: ShaderEntries;
}

export interface IPipelineUnitBuilder<T> {
  setOnBeforePass(f: PipelineCallback<T>): this;
  setOnAfterPass(f: PipelineCallback<T>): this;
  setDrawParams(...params: DrawParams): this;
  setWorkgroupSize(...size: [number, number, number]): this;
  finish(): IPipelineUnit<T>;
}

class PipelineUnitBuilder<T> implements IPipelineUnitBuilder<T> {
  type: PipelineType;
  label?: string;
  shader: string;
  onBeforePass?: PipelineCallback<T>;
  onAfterPass?: PipelineCallback<T>;
  deviceCtx: IDeviceContext;
  drawParams?: DrawParams;
  workgroupSize: [number, number, number] = [8, 8, 8];
  vertexBuffer?: GPUBuffer;
  pipeline?: Pipeline;
  bindGroupLayout?: GPUBindGroupLayout;
  shaderEntries?: ShaderEntries;

  constructor(options: PipelineOptions) {
    this.deviceCtx = options.deviceCtx;
    this.label = options.label;
    this.shader = options.shader;
    this.type = options.type ?? 'render';
    this.shaderEntries = options.shaderEntries;
  }

  setOnBeforePass(f: PipelineCallback<T>): this {
    this.onBeforePass = f;
    return this;
  }

  setOnAfterPass(f: PipelineCallback<T>): this {
    this.onAfterPass = f;
    return this;
  }

  setDrawParams(...params: DrawParams): this {
    this.drawParams = params;
    return this;
  }

  setWorkgroupSize(...size: [number, number, number]): this {
    this.workgroupSize = size;
    return this;
  }

  finish(): IPipelineUnit<T> {
    return new PipelineUnit<T>(this);
  }
}

class PipelineUnit<T> implements IPipelineUnit<T> {
  readonly id: PipelineID = uuidV4();
  deviceCtx: IDeviceContext;
  type: PipelineType;
  shader: string;
  label?: string;
  onBeforePass?: PipelineCallback<T>;
  onAfterPass?: PipelineCallback<T>;
  drawParams?: DrawParams;
  workgroupSize: [number, number, number];
  pipeline?: Pipeline;

  constructor(builder: PipelineUnitBuilder<T>) {
    this.deviceCtx = builder.deviceCtx;
    this.type = builder.type;
    this.shader = builder.shader;
    this.label = builder.label;
    this.onBeforePass = builder.onBeforePass;
    this.onAfterPass = builder.onAfterPass;
    this.drawParams = builder.drawParams;
    this.workgroupSize = builder.workgroupSize;

    if (this.type === 'render' && !this.drawParams) {
      throw new Error('Draw params not set');
    }
  }
}

export function createPipeline<T = PipelineGroupBaseState>(
  options: PipelineOptions
): IPipelineUnitBuilder<T> {
  return new PipelineUnitBuilder<T>(options);
}
