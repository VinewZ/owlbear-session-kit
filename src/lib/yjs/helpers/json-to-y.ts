import * as Y from "yjs";

export function jsonToY(
	target: Y.Map<unknown>,
	value: Record<string, unknown>,
) {
	target.clear();

	for (const [key, val] of Object.entries(value)) {
		if (val === null || val === undefined) continue;

		if (typeof val === "string") {
			const ytext = new Y.Text();
			ytext.insert(0, val);
			target.set(key, ytext);
			continue;
		}

		if (typeof val === "number" || typeof val === "boolean") {
			target.set(key, val);
			continue;
		}

		if (Array.isArray(val)) {
			const yarray = new Y.Array();
			target.set(key, yarray);
			applyArrayToY(yarray, val);
			continue;
		}

		if (typeof val === "object") {
			const child = new Y.Map();
			target.set(key, child);
			jsonToY(child, val as Record<string, unknown>);
		}
	}
}

function applyArrayToY(target: Y.Array<unknown>, arr: unknown[]) {
	for (const item of arr) {
		if (typeof item === "string") {
			const ytext = new Y.Text();
			ytext.insert(0, item);
			target.push([ytext]);
		} else if (typeof item === "object" && item !== null) {
			const child = new Y.Map();
			target.push([child]);
			jsonToY(child, item as Record<string, unknown>);
		} else {
			target.push([item]);
		}
	}
}
