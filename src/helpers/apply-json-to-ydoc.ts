import * as Y from "yjs";

export function applyJSONToYDoc(ydoc: Y.Doc, json: unknown, rootName: string) {
  ydoc.transact(() => {
    const root = ydoc.getMap(rootName);
    applyJSONToYType(root, json);
  });
}

function applyJSONToYType(target: Y.Map<any> | Y.Array<any>, value: any) {
  if (Array.isArray(value)) {
    if (!(target instanceof Y.Array)) {
      throw new Error("Target must be Y.Array for JSON array");
    }

    target.delete(0, target.length);

    value.forEach((item) => {
      target.push([convertValue(item)]);
    });

    return;
  }

  if (typeof value === "object" && value !== null) {
    if (!(target instanceof Y.Map)) {
      throw new Error("Target must be Y.Map for JSON object");
    }

    for (const [key, val] of Object.entries(value)) {
      const existing = target.get(key);

      if (isYType(existing)) {
        applyJSONToYType(existing, val);
      } else {
        target.set(key, convertValue(val));
      }
    }

    return;
  }

  throw new Error("Invalid root JSON value");
}

function convertValue(value: any): any {
  if (Array.isArray(value)) {
    const yarr = new Y.Array();
    value.forEach((v) => {
      yarr.push([convertValue(v)]);
    });
    return yarr; // ⚠️ caller must attach immediately
  }

  if (typeof value === "object" && value !== null) {
    const ymap = new Y.Map();
    for (const [k, v] of Object.entries(value)) {
      ymap.set(k, convertValue(v));
    }
    return ymap; // ⚠️ caller must attach immediately
  }

  return value;
}

function isYType(value: any): value is Y.AbstractType<any> {
  return value instanceof Y.AbstractType;
}
