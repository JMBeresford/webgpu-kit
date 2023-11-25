import type { ConstructorArgs } from "../utils";

export function WithLabel() {
  return class Label {
    label?: string;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- private
    constructor(..._args: ConstructorArgs) {}

    setLabel(label: string): void {
      this.label = label;
    }
  };
}
