# @webgpu-kit/core

##### A light wrapper around the webGPU API that aims to reduce boilerplate for render and compute operations.

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
  - [Pipelines](#pipelines)
  - [Pipeline Groups](#pipeline-groups)
  - [Bind Groups](#bind-groups)
  - [Uniform Buffers](#uniform-buffers)
  - [Storage Buffers](#storage-buffers)
  - [Samplers and Textures](#samplers-and-textures)
  - [Vertex Attribute Objects](#vertex-attribute-objects)

## Installation

Run the following to add the package to your project:

```sh
npm i @webgpu-kit/core

# or
yarn add @webgpu-kit/core

# or
pnpm i @webgpu-kit/core
```

## Overview

The package exposes an API that allows for easy construction and execution of webGPU
pipelines. An understanding of the webGPU spec/API is recommended but not stricly needed.

Read up on the webGPU spec [here](https://gpuweb.github.io/gpuweb/).

In @webgpu-kit/core, pipelines are intended to be shader-driven. They are generally intended also to be
executed in groups of pipelines that share bind-groups (GPU resources).

The following simple example showcases how one would render a quad to a canvas:

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
  RenderPipeline,
  PipelineGroup,
  Executor,
} from "@webgpu-kit/core";
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

await vao.addAttributes(posAttribute);

const pipeline = new RenderPipeline({
  label: "myQuad Render pipeline",
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

await executor.addPipelineGroups(pipelineGroup);
await executor.run();
```

Note that the shader declared the location of the position attribute,
and we used that location declaration in the instatiation of our [Attribute][attribute_source]
object. It is _mandatory_ that these values match. This will also be the case
for any other gpu-bound objects such as [Uniforms][uniform_source], [Textures][texture_source],
[Samplers][sampler_source] and [Storage][storage_source] objects which will be covered later.

---

### Pipelines

A [pipeline][pipeline_source] is essentially a context in which either a render or a compute
operation is defined. These pipelines are executed in batches (or singularly, if desired) via
[Pipeline Groups][pipeline_group_source].

[Pipelines][pipeline_source] can contain various types of state that will compose the operation to be executed:

- Shader Code
- Bind Groups composed of
  - [Uniform Buffers](#uniform-buffers)
  - [Storage Buffers](#storage-buffers)
  - [Samplers and Textures](#samplers-and-textures)

To create a [render pipeline][pipeline_source] you can do the following:

```ts
import { RenderPipeline } from "@webgpu-kit/core";
import myShader from "./myShader.wgsl";

const pipeline = new RenderPipeline({
  label: "My Render Pipeline",
  shader: myShader,
});
```

And similarly for a [compute pipeline][pipeline_source]:

```ts
import { ComputePipeline } from "@webgpu-kit/core";
import myShader from "./myShader.wgsl";

const pipeline = new ComputePipeline({
  label: "My Compute Pipeline",
  shader: myShader,
});
```

> reference the [source][pipeline_source] for the full list of constructor options available

---

### Pipeline Groups

A [pipeline group][pipeline_group_source] is a collection of [pipelines][pipeline_source] that
share [bind groups][bind_group_source]. This allows for an ergonmic way to execute multiple
render and/or compute passes within a shared context.

To create a [pipeline group][pipeline_group_source] you can do the following:

```ts
import { PipelineGroup, Pipeline } from "@webgpu-kit/core";
import myShader1 from "./myShader1.wgsl";
import myShader2 from "./myShader2.wgsl";

const pipeline1 = new Pipeline({
  label: "My Pipeline 1",
  shader: myShader1,
});

const pipeline2 = new Pipeline({
  label: "My Pipeline 2",
  shader: myShader2,
});

const pipelineGroup = new PipelineGroup({
  label: "My Pipeline Group",
  pipelines: [pipeline1, pipeline2],
});
```

> reference the [source][pipeline_group_source] for the full list of constructor options available

---

### Bind Groups

[Bind groups][bind_group_source] are collections of objects that are bound to the GPU. You can think of
them as a way to collect all of the resources that a shader needs to execute (except for those defined in the
[vertex attribute object][vao_source]). This is one of the primary ways to pass and update data from the CPU
to the GPU.

Bind groups contain the following types of objects:

- [Uniform Buffers](#uniform-buffers)
- [Storage Buffers](#storage-buffers)
- [Samplers and Textures](#samplers-and-textures)

[Bind groups][bind_group_source] are created and used like so:

```wgsl
// myShader.wgsl

@group(0) @binding(0) var<uniform> vec3<f32> uColor;
@group(0) @binding(1) var<storage> vertexColors: array<vec3<f32>>;
@group(0) @binding(2) var mySampler: sampler;
@group(0) @binding(3) var myTexture: texture_2d<f32>;

struct VertexInput {
  @location(0) pos: vec2<f32>,
  @location(1) texCoords: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  texCoords: vec2<f32>,
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  let output = VertexOutput(
    vec4<f32>(input.pos, 0.0, 1.0),
    input.texCoords,
  );
}

@fragment
fn fragmentMain(input: VertexOutput) {
  return textureSample(myTexture, mySampler, input.texCoords);
}
```

```ts
import {
  Uniform,
  Storage,
  Sampler,
  Texture,
  BindGroup,
} from "@webgpu-kit/core";

// assume we have a pipeline group already defined
import myPipelineGroup from "./myPipelineGroup";
import myShader from "./myShader.wgsl";

// note that the value of the binding property must match
// the binding location defined in the shader
const myColorUniform = new Uniform({ label: "color uniform", binding: 0 });
const myColorStorage = new Storage({ label: "color storage", binding: 1 });
const mySampler = new Sampler({ label: "my texture sampler", binding: 2 });
const myTexture = new Texture({ label: "my texture", binding: 3 });

const bindGroup = new BindGroup({
  label: "my bind group",
});

await bindGroup.addUniforms(myColorUniform);
await bindGroup.addStorages(myColorStorage);
await bindGroup.addSamplers(mySampler);
await bindGroup.addTextures(myTexture);

// optionally, update the bind group on the gpu
// if you elect to omit this here then it will
// be updated when the pipeline group is executed
await bindGroup.updateBindGroup();

// add the bind group to the pipeline group
await myPipelineGroup.setBindGroups(bindGroup);
```

> reference the [source][bind_group_source] for the full list of constructor options available

---

### Uniform Buffers

[Uniforms][uniform_source] are created and used like so:

> Pay close attention to how the binding location in the shader is matched by that defined
> in the Uniform instantiation. This is **mandatory**.

```ts
import { Uniform } from "@webgpu-kit/core";

const myShader = wgsl`

@group(0) @binding(0) var<uniform> vec3<f32> uColor;

@fragment
fn fragmentMain() {
  return vec4<f32>(uColor, 1.0);
} 
`;

const myColorUniform = new Uniform({ label: "color uniform", binding: 0 });

// add the uniform to a bind group in order to pass it to the shader
// note that the bind group must be added to a pipeline group in order
// to be used
await myBindGroup.addUniforms(myColorUniform);
```

> reference the [source][uniform_source] for the full list of constructor options available

---

### Storage Buffers

[Storages][storage_source] are created and used in the exact same fashion as [Uniforms][uniform_source]:

> Pay close attention to how the binding location in the shader is matched by that defined
> in the Storage instantiation. This is **mandatory**.

```ts
import { Storage } from "@webgpu-kit/core";

const myShader = wgsl`
  @group(0) @binding(0) var<storage> vertexColors: array<vec3<f32>>;

  @fragment
  fn fragmentMain(@builtin(vertex_index) vIndex) {
    return vec4<f32>(vertexColors[vIndex], 1.0);
  } 
`;

const myColorStorage = new Storage({ label: "color storage", binding: 0 });

// add the storage to a bind group in order to pass it to the shader
// note that the bind group must be added to a pipeline group in order
// to be used
await myBindGroup.addStorages(myColorStorage);
```

> reference the [source][storage_source] for the full list of constructor options available

---

### Samplers and Textures

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
import { Sampler, Texture, Pipeline } from "@webgpu-kit/core";
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

// add to a bind group in order to pass it to the shader
await myBindGroup.addSamplers(sampler);
await myBindGroup.addTextures(texture);
```

> reference the [Sampler source][sampler_source] and the
> [Texture source][texture_source] for the full list of constructor
> options available

---

### Vertex Attribute Objects

[Vertex attribute objects][vao_source], or VAO's, contain per-vertex (or per-instance) data commonly referred to as
[attributes][attribute_source]. The most common attribute is the position of each vertex. Each
[pipeline group][pipeline_group_source] will contain at least one VAO. The following example showcases
how to use a [VertexAttributeObject][vao_source]:

```ts
import {
  Attribute,
  VertexAttributeObject,
  PipelineGroup,
} from "@webgpu-kit/core";

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
  itemSize: 2, // how many elements of the input array each item is defined by
});

const vao = new VertexAttributeObject({
  label: "my vao",
  vertexCount: vertices.length / 2,
});

await vao.addAttributes(positionAttribute);

const pipelineGroup = new PipelineGroup({
  label: "my pipeline",
});

pipelineGroup.addVertesAttributeObjects(vao);
```

> reference the [Attribute source][attribute_source] and the
> [VertexAttributeObject source][vao_source] for the full list of constructor
> options available

[attribute_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Attribute.ts
[pipeline_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Pipeline.ts
[pipeline_group_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/PipelineGroup.ts
[executor_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Executor.ts
[uniform_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Uniform.ts
[storage_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Storage.ts
[sampler_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Sampler.ts
[texture_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/Texture.ts
[vao_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/VertexAttributeObject.ts
[bind_group_source]: https://github.com/JMBeresford/webgpu-kit/tree/main/packages/core/src/BindGroup.ts
