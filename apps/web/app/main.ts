import {
  deviceContext,
  createExecutor,
  createPipeline,
  createAttribute,
  createStorage,
  createPipelineGroup,
  createUniform,
} from '@wgpu-kit/core/lib';
import {
  GRID_SIZE,
  WORKGROUP_SIZE,
  computeShader,
  renderShader,
} from './shaders';

export async function runExample(canvas: HTMLCanvasElement): Promise<void> {
  const deviceCtx = await deviceContext({
    canvas,
    powerPreference: 'high-performance',
  });

  const device = deviceCtx.device;

  const vertices = new Float32Array([
    -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

    -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
  ]);

  const attributeBuffer = createAttribute({ name: 'pos' })
    .setFormat('float32x2')
    .setShaderLocation(0)
    .setArrayBuffer(vertices)
    .setItemSize(4)
    .setItemCount(2)
    .finish();

  const gridArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
  const gridUniform = createUniform({ name: 'grid' })
    .setVisibility(
      GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE
    )
    .setArrayBuffer(gridArray)
    .setBinding(0)
    .finish(device);

  const storageArray = new Uint32Array(GRID_SIZE * GRID_SIZE);
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    storageArray[i] = Math.random() > 0.6 ? 1 : 0;
  }

  const storageBuffer1 = createStorage({ name: 'cellState 1' })
    .setVisibility(GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE)
    .setBinding(1)
    .setArrayBuffer(storageArray)
    .setBufferOptions({ type: 'read-only-storage' })
    .finish(device);

  const storageBuffer2 = createStorage({ name: 'cellState 2' })
    .setVisibility(GPUShaderStage.COMPUTE)
    .setBinding(2)
    .setArrayBuffer(storageArray)
    .finish(device);

  const pipelineGroupBuilder = createPipelineGroup({
    deviceCtx,
    label: 'Game of Life Pipeline Group',
  })
    .addAttribute(attributeBuffer)
    .addUniform(gridUniform)
    .addStorage(storageBuffer1)
    .addStorage(storageBuffer2);

  const renderPass = createPipeline({
    label: 'Render Pass',
    deviceCtx,
    type: 'render',
    shader: renderShader,
  })
    .setDrawParams(vertices.length / 2, GRID_SIZE * GRID_SIZE)
    .finish();

  const workgroupSize = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
  const computePass = createPipeline({
    label: 'Compute Pass',
    deviceCtx,
    type: 'compute',
    shader: computeShader,
  })
    .setOnAfterPass((state) => {
      if (!state) return;

      state.activeBindGroupIdx += 1;
      state.activeBindGroupIdx %= state.bindGroups.length;
    })
    .setDispatchParams(workgroupSize, workgroupSize, 1)
    .finish();

  pipelineGroupBuilder
    .addPipeline(computePass)
    .addPipeline(renderPass)
    .setBindGroupCount(2);

  const bindGroupsEntries: GPUBindGroupEntry[][] = [
    [
      {
        binding: 0,
        resource: { buffer: gridUniform.gpuBuffer },
      },
      {
        binding: 1,
        resource: { buffer: storageBuffer1.gpuBuffer },
      },
      {
        binding: 2,
        resource: { buffer: storageBuffer2.gpuBuffer },
      },
    ],
    [
      {
        binding: 0,
        resource: { buffer: gridUniform.gpuBuffer },
      },
      {
        binding: 1,
        resource: { buffer: storageBuffer2.gpuBuffer },
      },
      {
        binding: 2,
        resource: { buffer: storageBuffer1.gpuBuffer },
      },
    ],
  ];

  const pipelineGroup = await pipelineGroupBuilder
    .setBindGroupEntries(bindGroupsEntries)
    .finish();

  const executor = createExecutor().addPipelineGroups([pipelineGroup]).finish();

  function tick(): void {
    executor.runPipelines();
    requestAnimationFrame(tick);
  }

  tick();
}
