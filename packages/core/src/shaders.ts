export const GRID_SIZE = 500;
export const WORKGROUP_SIZE = 8;

export const renderShader = /* wgsl */ `
  struct VertexInput {
    @location(0) pos: vec2<f32>,
    @builtin(instance_index) instance: u32,
  }

  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) cell: vec2<f32>,
  }

  @group(0) @binding(0) var<uniform> grid: vec2<f32>;
  @group(0) @binding(1) var<storage> cellState: array<u32, ${
    GRID_SIZE * GRID_SIZE
  }>;

  @vertex
  fn vertexMain(input: VertexInput) -> VertexOutput {
    let i = f32(input.instance);
    let cell = vec2f(i % grid.x, floor(i / grid.x));
    let state = f32(cellState[input.instance]);

    let cellOffset = cell / grid * 2;
    let gridPos = (input.pos * state + 1) / grid - 1 + cellOffset;

    var output = VertexOutput();
    output.pos = vec4(gridPos, 0.0, 1.0);
    output.cell = cell;
    return output;
  }

  @fragment
  fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return vec4(input.cell / grid, 0.0, 1.0);
  }
`;

export const computeShader = /* wgsl */ `
  @group(0) @binding(0) var<uniform> grid: vec2<f32>;

  @group(0) @binding(1) var<storage> cellStateIn: array<u32, ${
    GRID_SIZE * GRID_SIZE
  }>;

  @group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32, ${
    GRID_SIZE * GRID_SIZE
  }>;

  fn cellIndex(cell: vec2u) -> u32 {
    return (cell.y % u32(grid.y)) * u32(grid.x) +
          (cell.x % u32(grid.x));
  }

  fn cellActive(x: u32, y: u32) -> u32 {
    return cellStateIn[cellIndex(vec2(x, y))];
  }

  @compute
  @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
  fn computeMain(@builtin(global_invocation_id) cell: vec3<u32>) {
    var activeNeighbors = 0u;

    for (var y: u32 = 0u; y < 3u; y = y + 1u) {
      for (var x: u32 = 0u; x < 3u; x = x + 1u) {
        if (x == 1u && y == 1u) {
          continue;
        }

        activeNeighbors = activeNeighbors + cellActive(cell.x + x - 1u, cell.y + y - 1u);
      }
    }

    let i = cellIndex(cell.xy);

    switch activeNeighbors {
      case 2: { // Active cells with 2 neighbors stay active.
        cellStateOut[i] = cellStateIn[i];
      }
      case 3: { // Cells with 3 neighbors become or stay active.
        cellStateOut[i] = 1;
      }
      default: { // Cells with < 2 or > 3 neighbors become inactive.
        cellStateOut[i] = 0;
      }
    }
  }
`;
