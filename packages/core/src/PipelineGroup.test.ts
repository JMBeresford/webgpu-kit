import { it, describe, expect, vi } from "vitest";
import {
  MockWebGPU,
  MockDevice,
  MockCanvas,
  MockContext,
  MockCanvasFormat,
} from "../lib/MockWebGPU";
import { PipelineGroup } from "./PipelineGroup";

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

describe("PipelineGroup", () => {
  it("Should have a label", () => {
    const group = new PipelineGroup({ label: "Test", vertexCount: 0 });
    expect(group.label).toBe("Test");
  });
});
