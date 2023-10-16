# @wgpu-kit/core

### A light wrapper around the webGPU API that aims to reduce boilerplate.

## Table of Contents

<!--toc:start-->

- [Installation](#installation)
- [Overview](#overview)
  - [Pipelines](#pipelines)
  - [Uniform Buffers](#uniform-buffers)
  - [Storage Buffers](#storage-buffers)
  - [Samplers and Textures](#samplers-and-textures)

<!--toc:end-->

## Installation

Run the following to add the package to your project:

```sh
npm i @wgpu-kit/core
```

### Overview

The package exposes an API that allows for easy construction and execution of webGPU
pipelines. An understanding of the webGPU spec/API is recommended but not stricly needed.

In @wgpu-kit/core, pipelines are intended to be shader-driven. They are generally intended also to be
executed in groups of pipelines that share bind-groups (GPU bound resources).

The following example showcases how one would render a quad to a canvas:

```wgsl
// myShader.wgsl

struct VertexInput {
    @location(0) pos: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
}

fn vertexMain(inputs: VertexInput) -> VertexOutput {
    return vec4(inputs.pos, 0,0, 1.0);
}

fn fragmentMain(inputs: VertexOutput) -> location(0) vec4<f32> {
    return vec4(inputs.pos, 0.0, 1.0);
}
```

```ts
// myQuad.ts
import {
  Attribute,
  VertexAttributeObject,
  Pipeline,
  PipelineGroup,
  Executor,
} from "@wgpu-kit/core";
import myShader from "./myShader.wgsl";

const canvas = document.querySelector(".myCanvas");
const vertices = [
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

  -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
];

const posAttribute = new Attribute({
  label: "Position",
  format: "float32x2",
  shaderLocation: 0,
  arrayBuffer: vertices,
  itemCount: vertices.length / 2,
  itemSize: 2,
});

const vao = new VertexAttributeObject({
  label: "myQuad vao",
  vertexCount: vertices.length / 2,
});

await vao.addAttribute(posAttribute);

const pipeline = new Pipeline({
  label: "myQuad Render pipeline",
  type: "render",
  shader: myShader,
});

const pipelineGroup = new PipelineGroup({
  label: "myQuad pipeline group",
  pipelines: [pipeline],
  vertexAttributeObject: vao,
  canvas,
});

const executor = new Executor({
  label: "myQuad Executor",
});

await executor.addPipelineGroup(pipelineGroup);
await executor.run();
```

Note that the shader declared the location of the position attribute,
and we used that location declaration in the instatiation of our [Attribute][attribute_source]
object. It is _mandatory_ that these values match. This will also be the case
for any other gpu-bound objects such as [Uniforms][uniform_source], [Textures][texture_source],
[Samplers][sampler_source] and [Storage][storage_source] objects which will be covered later.

#### Pipelines

A [pipeline][pipeline_source] is essentially a context in which either a render or a compute
operation is defined. These pipelines are executed in batches via [Pipeline Groups][pipeline_group_source].

[Pipelines][pipeline_source] can contain various types of state that will compose the operation to be executed:

- Shader Code
- Bind Groups composed of
  - [Uniform Buffers](#uniform-buffers)
  - [Storage Buffers](#storage-buffers)
  - [Samplers and Textures](#samplers-and-textures)

To create a [pipeline][pipeline_source] you can do the following:

```ts
import { Pipeline } from "@wgpu-kit/core";
import myShader from "./myShader.wgsl";

const pipeline = new Pipeline({
  label: "My Pipeline",
  shader: myShader,
  type: "render",
});
```

> reference the [source][pipeline_source] for the full list of constructor options available

#### Uniform Buffers

[Uniforms][uniform_source] are created and used like so:

> Pay close attention to how the binding location in the shader is matched by that defined
> in the Uniform instantiation. This is **mandatory**.

```ts
import { Uniform, Pipeline } from "@wgpu-kit/core";

const myShader = wgsl`

@group(0) @binding(0) var<uniform> vec3<f32> uColor;

@fragment
fn fragmentMain() {
  return vec4<f32>(uColor, 1.0);
} 
`;

const myColorUniform = new Uniform({ label: "color uniform", binding: 0 });

// add the uniform to a pipelineGroup, and it will be available to
// all contained pipelines
await myPipelineGroup.addUniform(myColorUniform);
```

> reference the [source][uniform_source] for the full list of constructor options available

#### Storage Buffers

[Storages][storage_source] are created and used in the exact same fashion as [Uniforms][uniform_source]:

> Pay close attention to how the binding location in the shader is matched by that defined
> in the Storage instantiation. This is **mandatory**.

```ts
import { Storage, Pipeline } from "@wgpu-kit/core";

const myShader = wgsl`
  @group(0) @binding(0) var<storage> vertexColors: array<vec3<f32>>;

  @fragment
  fn fragmentMain(@builtin(vertex_index) vIndex) {
    return vec4<f32>(vertexColors[vIndex], 1.0);
  } 
`;

const myColorStorage = new Storage({ label: "color storage", binding: 0 });

// add the storage to a pipelineGroup, and it will be available to
// all contained pipelines
await myPipelineGroup.addStorage(myColorStorage);
```

> reference the [source][storage_source] for the full list of constructor options available

#### Samplers and Textures

Create and use [samplers][sampler_source] and [textures][texture_source] like so:

> Pay close attention to how the binding location in the shader is matched by that defined
> in the respective instantiations. This is **mandatory**.

```wgsl
// myShader.wgsl
@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

struct VertexOutput {
  texCoords: vec2<f32>,
}

@fragment
fn fragmentMain(input: VertexOutput) {
  return textureSample(myTexture, mySampler, input.texCoords);
}
```

```ts
import { Sampler, Texture, Pipeline } from "@wgpu-kit/core";
import myShader from "./myShader.wgsl";
import myImage from "./myImage.png";

const sampler = new Sampler({
  label: "my texture sampler",
  binding: 0,
  visibility: GPUShaderStage.FRAGMENT,
});

const texture = new Texture({
  label: "my texture",
  binding: 1,
  visibility: GPUShaderStage.FRAGMENT,
});

await texture.setFromImage(myImage);
await texture.generateMipmaps();

// add to pipeline group
await myPipelineGroup.addSampler(sampler);
await myPipelineGroup.addTexture(texture);
```

> reference the [Sampler source][sampler_source] and the
> [Texture source][texture_source] for the full list of constructor
> options available

#### Vertex Attribute Objects

[Vertex attribute objects][vao_source], or VAO's, contain per-vertex data commonly referred to as
[attributes][attribute_source]. The most common attribute is the position of each vertex. Each
[pipeline group][pipeline_group_source] will contain a VAO. The following example showcases
how to use a [VertexAttributeObject][vao_source]:

```ts
import {
  Attribute,
  VertexAttributeObject,
  PipelineGroup,
} from "@wgpu-kit/core";

const vertices = [
  // triangle 1
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

  // triangle 2
  -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
];

const positionAttribute = new Attribute({
  label: "positions",
  format: "float32x2", // vec2<f32> datatype
  shaderLocation: 0, // the location defined in the shader
  arrayBuffer: new Float32Array(vertices), // the data
  itemCount: vertices.length / 2, // 12 / 2 == 6 two-dimensional vertices
  itemSize: 2, // how many elements of the array each item is defined by
});

const vao = new VertexAttributeObject({
  label: "my vao",
  vertexCount: vertices.length / 2,
});

await vao.addAttribute(positionAttribute);

const pipelineGroup = new PipelineGroup({
  label: "my pipeline",
  vertexAttributeObject: vao,
});
```

> reference the [Attribute source][attribute_source] and the
> [VertexAttributeObject source][vao_source] for the full list of constructor
> options available

[attribute_source]: ./src/Attribute.ts
[pipeline_source]: ./src/Pipeline.ts
[pipeline_group_source]: ./src/PipelineGroup.ts
[executor_source]: ./src/Executor.ts
[uniform_source]: ./src/Uniform.ts
[storage_source]: ./src/Storage.ts
[sampler_source]: ./src/Sampler.ts
[texture_source]: ./src/Texture.ts
[vao_source]: ./src/VertexAttributeObject.ts
