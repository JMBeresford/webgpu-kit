import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";
import type { WithDevice } from "./Device";
import type { WithLabel } from "./Label";

export interface ShaderComponent {
  shader: string;
  shaderModule?: GPUShaderModule;
  shaderEntries: ShaderEntries;

  setShader: (shader: string) => void;
  buildShaderModule: () => Promise<void>;
  setShaderEntries: (entries: ShaderEntries) => void;
}

export type WithShader = InstanceType<ReturnType<typeof WithShader>>;
export type ShaderEntries = {
  vertex?: string;
  fragment?: string;
  compute?: string;
};

export function WithShader<
  TBase extends Constructor<WithDevice & Partial<WithLabel>>,
>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) implements ShaderComponent {
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
