import * as Y from "yjs";
import { jsonToY } from "./json-to-y";

export function replaceSheetFromJSON(
  ydoc: Y.Doc,
  sheetId: string,
  json: Record<string, any>,
) {
  const sheets = ydoc.getMap<Y.Map<any>>("sheets");

  ydoc.transact(() => {
    let sheet = sheets.get(sheetId);

    if (!sheet) {
      sheet = new Y.Map();
      sheets.set(sheetId, sheet);
    }

    jsonToY(sheet, json);
  });
}
