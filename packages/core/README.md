# @wgpu-kit/core

### A light wrapper around the webGPU API that aims to reduce boilerplate.

## Table of Contents

<!--toc:start-->

- [Installation](#installation)
- [Overview](#overview)
  - [Pipelines](#pipelines)
  - [Uniform Buffers](#uniform-buffers)
  - [Storage Buffers](#storage-buffers)
  - [Samplers](#samplers)

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

vao.addAttribute(posAttribute);

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

executor.addPipelineGroup(pipelineGroup);
executor.run();
```

Note that the shader declared the location of the position attribute,
and we used that location declaration in the instatiation of our `Attribute`
object. It is mandatory that these values match. This will also be the case
for any other gpu-bound objects such as Uniforms, Textures, Samplers and Storage
objects which will be covered later.

#### Pipelines

A pipeline is essentially a context in which either a render or a compute operation is defined.

Pipelines can contain various types of state that will compose the operation to be executed:

- Shader Code
- Bind Groups composed of
  - [Uniform Buffers](#uniform-buffers)
  - [Storage Buffers](#storage-buffers)
  - Texture Objects
  - Sampler Objects
- Vertex Attribute Objects

To create a pipeline you can do the following:

```ts
import { Pipeline } from "@wgpu-kit/core";
import myShader from "./myShader.wgsl";

const pipeline = new Pipeline({
  label: "My Pipeline",
  shader: myShader,
  type: "render",
});
```

> reference the [source](./src/Pipeline.ts) for the full list of constructor options available

#### Uniform Buffers

Uniforms are created and used like so:

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
myPipelineGroup.addUniform(myColorUniform);
```

#### Storage Buffers

Storages are created and used like in the exact same fashion as [Uniforms](#uniform-buffers)

> Pay close attention to how the binding location in the shader is matched by that defined
> in the Storage instantiation. This is **mandatory**.

```ts
import { Storage, Pipeline } from "@wgpu-kit/core";

const myShader = wgsl`

@group(0) @binding(0) var<storage> array<vec3<f32>> vertexColors;

@fragment
fn fragmentMain(@builtin(vertex_index) vIndex) {
  return vec4<f32>(vertexColors[vIndex], 1.0);
} 
`;

const myColorStorage = new Storage({ label: "color storage", binding: 0 });

// add the storage to a pipelineGroup, and it will be available to
// all contained pipelines
myPipelineGroup.addStorage(myColorStorage);
```

#### Samplers
