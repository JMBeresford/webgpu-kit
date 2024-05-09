import * as code from "./main?raw";
import { runExample } from "./main";

export const InstancesExample = {
  title: "Instances",
  url: "instances",
  code: [{ text: code.default, language: "ts", filename: "main.ts" }],
  description: "A simple example of instanced rendering.",
  run: runExample,
};
