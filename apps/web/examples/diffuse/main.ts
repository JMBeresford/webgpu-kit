import {
  Attribute,
  BindGroup,
  Executor,
  IndexBuffer,
  PipelineGroup,
  RenderPipeline,
  Uniform,
  VertexAttributeObject,
} from "@webgpu-kit/core/src";
import {
  diffuseLambertian,
  diffuseOrenNayar,
  linearToGamma,
} from "@webgpu-kit/shaders/src/";
import { mat4 } from "gl-matrix";
import { generateSphere } from "./sphere";

export async function runExample(canvas: HTMLCanvasElement): Promise<void> {
  const sphere = generateSphere(1, 30, 30);

  const posAttribute = new Attribute({
    format: "float32x3",
    itemSize: 3,
    itemCount: sphere.vertices.length / 3,
    arrayBuffer: new Float32Array(sphere.vertices),
    shaderLocation: 0,
  });

  const normalsAttribute = new Attribute({
    format: "float32x3",
    itemSize: 3,
    itemCount: sphere.normals.length / 3,
    arrayBuffer: new Float32Array(sphere.normals),
    shaderLocation: 1,
  });

  const vao = new VertexAttributeObject({
    itemCount: sphere.vertices.length / 3,
  });

  await vao.addAttributes(posAttribute, normalsAttribute);

  const indexBuffer = new IndexBuffer({
    arrayBuffer: new Uint16Array(sphere.indices),
  });

  const modelMatrix = mat4.create();
  const perspectiveMatrix = mat4.create();

  mat4.translate(modelMatrix, modelMatrix, [0, 0, -3]);
  mat4.perspective(
    perspectiveMatrix,
    55,
    canvas.width / canvas.height,
    0.1,
    10,
  );

  const modelMatrixUniform = new Uniform({
    label: "Model matrix uniform",
    binding: 0,
    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    arrayBuffer: new Float32Array(modelMatrix),
  });

  const perspectiveMatrixUniform = new Uniform({
    label: "Perspective matrix uniform",
    binding: 1,
    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    arrayBuffer: new Float32Array(perspectiveMatrix),
  });

  const timeUniform = new Uniform({
    label: "Time uniform",
    binding: 2,
    visibility: GPUShaderStage.FRAGMENT,
    arrayBuffer: new Float32Array([0]),
  });

  const bindGroup = new BindGroup();
  await bindGroup.addUniforms(
    modelMatrixUniform,
    perspectiveMatrixUniform,
    timeUniform,
  );
  await bindGroup.updateBindGroup();

  const shader = /* wgsl */ `
    struct VertexInput {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
    }

    struct VertexOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) modelPosition: vec3<f32>,
      @location(1) normal: vec3<f32>,
    }

    @group(0) @binding(0) var<uniform> modelMatrix: mat4x4<f32>;
    @group(0) @binding(1) var<uniform> perspectiveMatrix: mat4x4<f32>;
    @group(0) @binding(2) var<uniform> time: f32;

    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput {
      var output = VertexOutput();

      let modelPos = modelMatrix * vec4<f32>(input.position, 1.0);
      output.position = perspectiveMatrix * modelPos;
      output.modelPosition = modelPos.xyz;
      output.normal = normalize(input.normal);

      return output;
    }

    ${diffuseOrenNayar()}
    ${diffuseLambertian()}
    ${linearToGamma()}

    struct Light {
      position: vec3<f32>,
      color: vec3<f32>,
    };

    fn getDiffuseLighting(light: Light, inputs: VertexOutput) -> vec3<f32> {
      let lightDirection = normalize(light.position - inputs.modelPosition);
      let cameraDirection = normalize(vec3<f32>(0.0, 0.0, 0.0) - inputs.modelPosition);

      let roughness = 0.0;

      let diffuseFactor = diffuseOrenNayar(
        inputs.normal,
        lightDirection,
        cameraDirection,
        light.color,
        roughness,
      );

      return diffuseFactor * light.color;
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
      let r = 50.2;
      let lights: array<Light, 2> = array<Light, 2>(
        // blue light
        Light(vec3<f32>(cos(time * 1.2) * r, sin(time * 1.2) * r, -3.0), vec3<f32>(0.0, 0.0, 1.0)),
        // red light
        Light(vec3<f32>(-3.0, cos(time) * r, sin(time) * r), vec3<f32>(1.0, 0.0, 0.0))
      );

      let diffuseColor = vec3<f32>(0.25, 0.25, 0.25);

      // ambient value of 0.02
      var diffuseLighting = vec3<f32>(0.02, 0.02, 0.02);

      for (var i = 0u; i < 2u; i = i + 1u) {
        diffuseLighting = diffuseLighting + getDiffuseLighting(lights[i], input);
      }

      let color = diffuseLighting * diffuseColor;
      return vec4<f32>(linearToGamma(color), 1.0);
    }
    `;

  const pipeline = new RenderPipeline({
    shader,
    canvas,
    enableDepthStencil: true,
    enableMultiSampling: true,
    clearColor: [0.2, 0.1, 0.4, 1.0],
    onAfterPass: async () => {
      if (!timeUniform.cpuBuffer) return;
      timeUniform.cpuBuffer[0] += 0.01;
      await timeUniform.updateGpuBuffer();
    },
  });

  const pipelineGroup = new PipelineGroup({
    pipelines: [pipeline],
    vertexCount: sphere.vertices.length / 3,
  });

  await pipelineGroup.setIndexBuffer(indexBuffer);
  await pipelineGroup.setBindGroups(bindGroup);
  pipelineGroup.addVertexAttributeObjects(vao);

  const executor = new Executor();
  await executor.addPipelineGroups(pipelineGroup);

  async function render(): Promise<void> {
    await executor.run();
    await new Promise(requestAnimationFrame);
    await render();
  }

  await render();
}
