import * as code from "./main?raw";
import { runExample } from "./main";

export const DiffuseLightingExample = {
  title: "Diffuse Lighting",
  url: "diffuse",
  code: [{ text: code.default, language: "ts", filename: "main.ts" }],
  description: "A simple example of diffuse lighting.",
  run: runExample,
};
