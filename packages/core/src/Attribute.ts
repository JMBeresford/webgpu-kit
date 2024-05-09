import { WithCanvas } from "./components/Canvas";
import { WithCpuBuffer } from "./components/CpuBuffer";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import type { ArrayType } from "./utils";

const components = WithDevice(WithCanvas(WithCpuBuffer(WithLabel())));

/**
 * {@link Attribute} constructor parameters
 */
export type AttributeOptions = {
  label?: string;
  format: GPUVertexFormat;

  /**
   * The value of the location directive of the attribute in the shader
   * e.g.
   * ```wgsl
   * @location(0) pos: vec3<f32>
   * ```
   * would have a shaderLocation of 0.
   */
  shaderLocation: number;

  /**
   * The number of components in each item of the attribute
   * e.g.
   * ```wgsl
   * @location(0) pos: vec3<f32>
   * ```
   * would have an itemSize of 3.
   */
  itemSize: number;

  /**
   * The number of items in the attribute. For example, given a vertex
   * attribute this would the number of vertices stored in the buffer.
   *
   *
   * e.g.
   * ```ts
   * const triangleVertices = new Float32Array([
   *  -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
   * ]);
   *
   * const posAttribute = new Attribute({
   *  // other stuff
   *  format: "float32x2",
   *  itemCount: triangleVertices.length / 2,
   * });
   * ```
   * would have an itemCount of 3, because three 2D vertices are contained
   * in the buffer.
   */
  itemCount: number;
  arrayBuffer: ArrayType;
};

/**
 * An attribute object that contains vertex data
 */
export class Attribute extends components {
  /** The format that the data is stored in */
  readonly format: GPUVertexFormat;
  readonly shaderLocation: number;
  readonly itemSize: number;
  readonly itemCount: number;
  readonly cpuBuffer: ArrayType;

  constructor(options: AttributeOptions) {
    super();
    this.label = options.label;
    this.format = options.format;
    this.shaderLocation = options.shaderLocation;
    this.itemSize = options.itemSize;
    this.itemCount = options.itemCount;
    this.cpuBuffer = options.arrayBuffer;
  }
}
