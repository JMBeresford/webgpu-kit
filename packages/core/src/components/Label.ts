import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";

export type WithLabel = InstanceType<ReturnType<typeof WithLabel>>;

export function WithLabel<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) {
    label?: string;

    setLabel(label: string): void {
      this.label = label;
    }
  };
}
