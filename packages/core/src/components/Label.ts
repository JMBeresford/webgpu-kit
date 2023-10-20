import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";

export interface LabelComponent {
  label?: string;

  setLabel(label: string): void;
}

export type WithLabel = InstanceType<ReturnType<typeof WithLabel>>;

export function WithLabel<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) implements LabelComponent {
    label?: string;

    setLabel(label: string): void {
      this.label = label;
    }
  };
}
