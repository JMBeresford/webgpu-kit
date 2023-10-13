# WGPUKit

### An all-purpose webGPU toolkit

> UNDER HEAVY DEVELOPMENT

## Table of Contents

<!--toc:start-->

- [About this project](#about-this-project)
- [Packages](#packages)
- [Installation](#installation)

<!--toc:end-->

---

## About this project

WGPUKit aims to provide varying levels of abstraction around the webGPU spec.

The `core` package is intended to be a small wrapper around webGPU to reduce boilerplate and
to make construction and execution of pipelines more straight-forward.

The `forward` package is intended to be yet another small wrapper around the core package that
exposes an API for a forward rendering solution akin to Three.js.

Other packages are planned to expose additional APIs:

- `shaders`: contains reusable, configurable wgsl shader chunks
- `react`: contains react bindings for the core/forward packages

## Packages

- [core](packages/core/README.md)
- forward
- shaders

## Installation

In order to install the packages run the following:

```sh
# npm i @wgpu-kit/<package>

# e.g. to install the core package
npm i @wgpu-kit/core
```
