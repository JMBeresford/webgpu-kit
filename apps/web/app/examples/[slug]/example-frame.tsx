"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { Examples } from "../../../examples";
import type { Example as ExampleData } from "../../../examples";
import { WebgpuCheck } from "./webgpu-check";

type Props = {
  title: ExampleData["title"];
};

export function ExampleFrame(props: Props): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  const data = useMemo(
    () => Examples.find((example) => example.url === props.title),
    [props.title],
  );

  if (!data) {
    throw new Error(`No example found for slug: ${props.title}`);
  }

  useEffect(() => {
    if (ref.current) {
      data.run(ref.current).catch((e) => {
        // eslint-disable-next-line no-console -- logging
        console.error(e);
        setError(true);
      });
    }
  }, [data]);

  return (
    <>
      <canvas ref={ref} />
      <WebgpuCheck error={error} />
    </>
  );
}
