import { it, describe, expect, vi } from "vitest";
import {
  MockWebGPU,
  MockDevice,
  MockContext,
  MockCanvas,
  MockCanvasFormat,
} from "../lib/MockWebGPU";
import { Attribute } from "./Attribute";
import { VertexAttributeObject } from "./VertexAttributeObject";

vi.mock("./utils", async () => {
  const actual = await vi.importActual("./utils");
  for (const key in MockWebGPU) {
    vi.stubGlobal(
      key,
      vi.fn(() => MockWebGPU[key]),
    );
  }

  return {
    ...(actual as Record<string, unknown>),
    getDefaultDevice: () => MockDevice,
    getDefaultCanvas: () => MockCanvas,
    getDefaultContext: () => MockContext,
    getDefaultCanvasFormat: () => MockCanvasFormat,
  };
});

describe("VertexAttributeObject", () => {
  it("should create an instance", () => {
    expect(new VertexAttributeObject({ itemCount: 0 })).toBeTruthy();
  });

  it("should create an instance with a label", () => {
    const attr = new VertexAttributeObject({ label: "vao", itemCount: 0 });
    expect(attr).toBeTruthy();

    expect(attr.label).toBe("vao");
  });

  it("should allow adding an attribute", async () => {
    const vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);
    const attribute = new Attribute({
      label: "position",
      format: "float32x2",
      itemSize: 2,
      itemCount: 3,
      arrayBuffer: vertices,
      shaderLocation: 0,
    });

    const vao = new VertexAttributeObject({ itemCount: 3 });
    await vao.addAttributes(attribute);
    expect(vao.attributes.length).toBe(1);
    expect(vao.cpuBuffer).toEqual(vertices);
  });

  it("should allow adding multiple attributes", async () => {
    const vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);
    const colors = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    const position = new Attribute({
      label: "position",
      format: "float32x2",
      itemSize: 2,
      itemCount: 3,
      arrayBuffer: vertices,
      shaderLocation: 0,
    });

    const color = new Attribute({
      label: "color",
      format: "float32x3",
      itemSize: 3,
      itemCount: 3,
      arrayBuffer: colors,
      shaderLocation: 1,
    });

    const vao = new VertexAttributeObject({ itemCount: 3 });
    await vao.addAttributes(position);
    await vao.addAttributes(color);
    expect(vao.attributes.length).toBe(2);
    expect(vao.cpuBuffer).toEqual(
      new Float32Array([-1, -1, 1, 0, 0, 0, 1, 0, 1, 0, 1, -1, 0, 0, 1]),
    );

    expect(vao.layout).toEqual({
      arrayStride: 20,
      attributes: [
        {
          format: "float32x2",
          offset: 0,
          shaderLocation: 0,
        },
        {
          format: "float32x3",
          offset: 8,
          shaderLocation: 1,
        },
      ],
      stepMode: "vertex",
    });
  });
});
