import { WithLabel } from "./Label";

const components = WithLabel();

export function WithPrimitive<TBase extends typeof components>(Base: TBase) {
  return class extends Base {
    primitiveState: GPUPrimitiveState = {
      topology: "triangle-list",
      stripIndexFormat: undefined,
      frontFace: "ccw",
      cullMode: "none",
    };

    setTopology(topology: GPUPrimitiveTopology) {
      this.primitiveState.topology = topology;
    }

    setStripIndexFormat(format: GPUIndexFormat) {
      this.primitiveState.stripIndexFormat = format;
    }

    setFrontFace(face: GPUFrontFace) {
      this.primitiveState.frontFace = face;
    }

    setCullMode(mode: GPUCullMode) {
      this.primitiveState.cullMode = mode;
    }
  };
}
