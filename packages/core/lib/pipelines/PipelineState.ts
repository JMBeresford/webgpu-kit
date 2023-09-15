export interface PipelineGroupBaseState {
  activeBindGroupIdx: number;
  bindGroups: GPUBindGroup[];
}

export type PipelineGroupState<T = {}> = PipelineGroupBaseState & T;
