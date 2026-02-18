import { isPlainObject } from "is-plain-object";

import type { DiceStyle } from "./DiceStyle";
import type { DiceType } from "./DiceType";

export interface Die {
  id: string;
  style: DiceStyle;
  type: DiceType;
}

export function isDie(value: any): value is Die {
  return isPlainObject(value) && typeof value.id === "string";
}
