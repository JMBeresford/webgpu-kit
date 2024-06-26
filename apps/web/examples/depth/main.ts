import { mat4 } from "gl-matrix";
import { Attribute } from "@webgpu-kit/core/Attribute";
import { Executor } from "@webgpu-kit/core/Executor";
import { RenderPipeline } from "@webgpu-kit/core/Pipeline";
import { PipelineGroup } from "@webgpu-kit/core/PipelineGroup";
import { Uniform } from "@webgpu-kit/core/Uniform";
import { VertexAttributeObject } from "@webgpu-kit/core/VertexAttributeObject";
import { Texture } from "@webgpu-kit/core/Texture";
import { Sampler } from "@webgpu-kit/core/Sampler";
import { BindGroup } from "@webgpu-kit/core/BindGroup";
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
    itemCount: vertices.length / 2,
  });

  await vao.addAttributes(posAttribute);

  const pipeline = new RenderPipeline({
    label: "Render pipeline",
    enableDepthStencil: true,
    canvas,
    shader: /* wgsl */ `
      struct VertexInput {
        @builtin(instance_index) instanceIndex: u32,
        @location(0) pos: vec2<f32>,
      }

      struct VertexOutput {
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>,
      }

      @group(0) @binding(2) var<uniform> matrix: mat4x4<f32>;

      @vertex
      fn vertexMain(input: VertexInput) -> VertexOutput {
        var output = VertexOutput();

        var position = vec4<f32>(input.pos * 0.5, f32(input.instanceIndex) * -1.0, 1.0);
        position = matrix * position;

        output.pos = position;
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
          return vec4<f32>(1.0, 1.0, 1.0, 1.0);
        }

        return tex;
      }
    `,
  });

  pipeline.setClearColor([0.9, 0.9, 1.0, 1.0]);

  const pipelineGroup = new PipelineGroup({
    label: "Render pipeline group",
    instanceCount: 5,
    vertexCount: vertices.length / 2,
    pipelines: [pipeline],
  });

  pipelineGroup.addVertexAttributeObjects(vao);

  const logoTex = new Texture({
    label: "Logo texture",
    binding: 0,
    visibility: GPUShaderStage.FRAGMENT,
  });

  await logoTex.setFromImage(texture.src);
  await logoTex.generateMipMaps();

  const sampler = new Sampler({
    label: "Logo sampler",
    binding: 1,
    visibility: GPUShaderStage.FRAGMENT,
  });

  await sampler.updateSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  const viewMatrix = mat4.create();
  const projMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [1, 0, 2], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, 45, canvas.width / canvas.height, 0.1, 100);

  mat4.multiply(viewMatrix, projMatrix, viewMatrix);

  const matrixUniform = new Uniform({
    label: "Matrix uniform",
    binding: 2,
    visibility: GPUShaderStage.VERTEX,
    arrayBuffer: new Float32Array(viewMatrix.values()),
  });

  const bindGroup = new BindGroup();

  await bindGroup.addTextures(logoTex);
  await bindGroup.addSamplers(sampler);
  await bindGroup.addUniforms(matrixUniform);

  await pipelineGroup.setBindGroups(bindGroup);

  const executor = new Executor({
    label: "Render executor",
  });

  await executor.addPipelineGroups(pipelineGroup);

  async function tick(): Promise<void> {
    await executor.run();
    await new Promise(requestAnimationFrame);
    await tick();
  }

  await tick();
}
