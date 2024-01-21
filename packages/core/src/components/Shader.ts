import { WithDevice } from "./Device";
import { WithLabel } from "./Label";

export type ShaderEntries = {
  vertex: string;
  fragment: string;
  compute: string;
};

const components = WithDevice(WithLabel());

export function WithShader<TBase extends typeof components>(Base: TBase) {
  return class extends Base {
    shader = "";
    shaderModule?: GPUShaderModule;
    shaderEntries: ShaderEntries = {
      vertex: "vertexMain",
      fragment: "fragmentMain",
      compute: "computeMain",
    };

    setShader(shader: string) {
      this.shader = shader;
    }

    async buildShaderModule() {
      const device = await this.getDevice();
      this.shaderModule = device.createShaderModule({
        label: `${this.label ?? "Unlabelled"} shader'}`,
        code: this.shader,
      });
    }

    setShaderEntries(entries: ShaderEntries) {
      this.shaderEntries = entries;
    }
  };
}
