import { it, describe, expect, vi } from "vitest";
import {
  MockWebGPU,
  MockDevice,
  MockCanvas,
  MockContext,
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
    defaultDevice: () => MockDevice,
    defaultCanvas: () => MockCanvas,
    defaultContext: () => MockContext,
    defaultCanvasFormat: () => "rgba8unorm",
  };
});

describe("PipelineGroup", () => {
  it("Should have a label", () => {
    const group = new PipelineGroup({ label: "Test" });
    expect(group.label).toBe("Test");
  });
});
