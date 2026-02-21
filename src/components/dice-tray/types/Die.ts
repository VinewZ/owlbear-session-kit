import { isPlainObject } from "is-plain-object";

import type { DiceStyle } from "./DiceStyle";
import type { DiceType } from "./DiceType";

export interface Die {
	id: string;
	style: DiceStyle;
	type: DiceType;
}

export function isDie(value: unknown): value is Die {
	return (
		isPlainObject(value) &&
		typeof (value as Record<string, unknown>).id === "string"
	);
}
