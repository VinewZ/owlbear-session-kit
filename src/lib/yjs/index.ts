import * as Y from "yjs";

export function getOrCreateSheet<T extends object>(
  sheets: Y.Map<Y.Map<T>>,
  sheetId: string,
): Y.Map<T> {
  let sheet = sheets.get(sheetId);
  if (!sheet) {
    sheet = new Y.Map<T>();
    sheets.set(sheetId, sheet);
  }
  return sheet;
}

export type Yjsify<T> = T extends (infer U)[]
  ? Y.Array<Yjsify<U>>
  : T extends object
  ? Y.Map<{ [K in keyof T]: Yjsify<T[K]> }>
  : T;

// Overloads to help TypeScript understand push/set
// biome-ignore lint/suspicious/noExplicitAny: any needed for overloads
export function convertToY<T extends any[]>(obj: T): Y.Array<Yjsify<T[number]>>;
export function convertToY<T extends object>(
  obj: T,
): Y.Map<{ [K in keyof T]: Yjsify<T[K]> }>;
export function convertToY<
  T extends string | number | boolean | null | undefined,
>(obj: T): T;

// biome-ignore lint/suspicious/noExplicitAny: any needed for overloads
export function convertToY(obj: any): any {
  if (Array.isArray(obj)) {
    const yArray = new Y.Array();
    for (const item of obj) {
      yArray.push([convertToY(item)]);
    }
    return yArray;
  } else if (obj && typeof obj === "object") {
    const yMap = new Y.Map();
    for (const key of Object.keys(obj)) {
      yMap.set(key, convertToY(obj[key]));
    }
    return yMap;
  } else {
    return obj;
  }
}
