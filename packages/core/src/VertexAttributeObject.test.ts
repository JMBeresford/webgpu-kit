import { it, describe, expect } from "vitest";
import { Attribute } from "./Attribute";
import { VertexAttributeObject } from "./VertexAttributeObject";

describe("VertexAttributeObject", () => {
  it("should create an instance", () => {
    expect(new VertexAttributeObject({ vertexCount: 0 })).toBeTruthy();
  });

  it("should create an instance with a label", () => {
    expect(
      new VertexAttributeObject({ label: "vao", vertexCount: 0 }),
    ).toBeTruthy();
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

    const vao = new VertexAttributeObject({ vertexCount: 3 });
    await vao.addAttribute(attribute);
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

    const vao = new VertexAttributeObject({ vertexCount: 3 });
    await vao.addAttribute(position);
    await vao.addAttribute(color);
    expect(vao.attributes.length).toBe(2);
    expect(vao.cpuBuffer).toEqual(new Float32Array([...vertices, ...colors]));

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
    });
  });
});
