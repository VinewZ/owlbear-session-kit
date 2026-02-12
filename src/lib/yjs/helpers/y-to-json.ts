import * as Y from "yjs";
import type { JSONValue } from "../types";

export function yToJSON(value: unknown): JSONValue {
	if (value instanceof Y.Text) {
		return value.toString();
	}

	if (value instanceof Y.Array) {
		return value.toArray().map(yToJSON);
	}

	if (value instanceof Y.Map) {
		const obj: Record<string, JSONValue> = {};
		(value as Y.Map<unknown>).forEach((v, k) => {
			obj[k] = yToJSON(v);
		});
		return obj;
	}

	return value as JSONValue;
}
