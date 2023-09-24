import { v4 as uuidv4 } from "uuid";
import type { Constructor } from "../utils";
import { fallbackToEmpty } from "../utils";

export type WithId = InstanceType<ReturnType<typeof WithId>>;

export function WithId<TBase extends Constructor>(Base?: TBase) {
  return class extends fallbackToEmpty(Base) {
    readonly id: string = uuidv4();
  };
}
