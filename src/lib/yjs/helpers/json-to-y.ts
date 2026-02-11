import * as Y from "yjs";
import type { JSONValue } from "../types";

export function jsonToY(value: JSONValue): any {
  if (value === null) return null;

  if (typeof value === "string") {
    const ytext = new Y.Text();
    ytext.insert(0, value);
    return ytext;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const yarray = new Y.Array();
    yarray.push(value.map(jsonToY));
    return yarray;
  }

  if (typeof value === "object") {
    const ymap = new Y.Map();
    for (const [key, val] of Object.entries(value)) {
      ymap.set(key, jsonToY(val));
    }
    return ymap;
  }

  throw new Error("Unsupported JSON value");
}
