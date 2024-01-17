"use client";

import { Canvas } from "@react-three/fiber";
import { Grid } from "./grid";

export function Scene(
  props: Omit<JSX.IntrinsicElements["div"], "children">,
): JSX.Element {
  return (
    <div {...props}>
      <Canvas dpr={[1, 2]}>
        <Grid />
      </Canvas>
    </div>
  );
}
