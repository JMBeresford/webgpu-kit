import {
  Attribute,
  Executor,
  Pipeline,
  PipelineGroup,
  Sampler,
  Texture,
  VertexAttributeObject,
} from "@wgpu-kit/core/src";
import texture from "./logo.png";

export async function runExample(canvas: HTMLCanvasElement): Promise<void> {
  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
  ]);

  const posAttribute = new Attribute({
    label: "Position attribute",
    format: "float32x2",
    arrayBuffer: vertices,
    itemCount: vertices.length / 2,
    itemSize: 2,
    shaderLocation: 0,
  });

  const vao = new VertexAttributeObject({
    vertexCount: vertices.length / 2,
  });

  await vao.addAttribute(posAttribute);

  const pipeline = new Pipeline({
    label: "Render pipeline",
    shader: /* wgsl */ `
      struct VertexInput {
        @location(0) pos: vec2<f32>,
      }

      struct VertexOutput {
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>,
      }

      @vertex
      fn vertexMain(input: VertexInput) -> VertexOutput {
        var output = VertexOutput();

        output.pos = vec4<f32>(input.pos, 0.0, 1.0);
        output.uv = (input.pos + 1.0) / 2.0;
        output.uv = vec2<f32>(output.uv.x, 1.0 - output.uv.y);

        return output;
      }

      @group(0) @binding(0) var tex: texture_2d<f32>;
      @group(0) @binding(1) var texSampler: sampler;

      @fragment
      fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
        let tex = textureSample(tex, texSampler, input.uv);

        if (tex.a < 0.5) {
          discard;
        }

        return tex;
      }
    `,
  });

  pipeline.setClearColor([0.9, 0.9, 1.0, 1.0]);

  const pipelineGroup = new PipelineGroup({
    label: "Render pipeline group",
    vertexAttributeObject: vao,
    pipelines: [pipeline],
    canvas,
  });

  const logoTex = new Texture({
    label: "Logo texture",
    binding: 0,
    visibility: GPUShaderStage.FRAGMENT,
  });

  await logoTex.setFromImage(texture.src);

  const sampler = new Sampler({
    label: "Logo sampler",
    binding: 1,
    visibility: GPUShaderStage.FRAGMENT,
  });

  await sampler.updateSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  await pipelineGroup.addTexture(logoTex);
  await pipelineGroup.addSampler(sampler);

  const executor = new Executor({
    label: "Render executor",
  });

  await executor.addPipelineGroup(pipelineGroup);

  await executor.run();
}
