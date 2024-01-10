"use client";
import { useEffect, useState } from "react";
import { Toast, ToastAction, ToastContent } from "ui/toast";
import { ExternalLinkIcon } from "../../../components/external-link-icon";

export function WebgpuCheck({
  error = false,
}: {
  error?: boolean;
}): JSX.Element {
  const [hasGpu, setHasGpu] = useState(true);

  useEffect(() => {
    async function tryGetGpu(): Promise<void> {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error("No adapter");
      }

      const _device = await adapter.requestDevice();
    }

    tryGetGpu().catch(() => {
      setHasGpu(false);
    });
  }, []);

  return (
    <Toast kind="error" title="Oops, no GPU!" visible={!hasGpu || error}>
      <ToastContent>This example could not run in this browser</ToastContent>
      <ToastAction
        onClick={() => {
          window.open(
            "https://github.com/gpuweb/gpuweb/wiki/Implementation-Status",
            "_blank",
          );
        }}
      >
        Learn more <ExternalLinkIcon />
      </ToastAction>
    </Toast>
  );
}
