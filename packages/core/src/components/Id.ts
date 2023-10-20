import { v4 as uuidv4 } from "uuid";
import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";

export interface IdComponent {
  readonly id: string;
}

export type WithId = InstanceType<ReturnType<typeof WithId>>;

export function WithId<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) implements IdComponent {
    readonly id: string = uuidv4();
  };
}
