import { v4 as uuidv4 } from "uuid";
import type { Constructor } from "../utils";

export function WithId<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    readonly id: string = uuidv4();
  };
}
