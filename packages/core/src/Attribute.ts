import { WithCpuBuffer } from "./components/CpuBuffer";
import { WithDevice } from "./components/Device";
import { WithLabel } from "./components/Label";
import type { ArrayType } from "./utils";

const Mixins = WithDevice(WithCpuBuffer(WithLabel()));

/**
 * {@link Attribute} constructor parameters
 */
type AttributeOptions = {
  label?: string;
  format: GPUVertexFormat;
  shaderLocation: number;
  itemSize: number;
  itemCount: number;
  arrayBuffer: ArrayType;
};

/**
 * An attribute object that contains vertex data
 */
export class Attribute extends Mixins {
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
