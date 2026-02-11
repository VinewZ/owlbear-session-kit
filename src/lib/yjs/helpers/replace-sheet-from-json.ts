import * as Y from "yjs";
import { jsonToY } from "./json-to-y";
export function replaceSheetFromJSON(
  ydoc: Y.Doc,
  sheetId: string,
  json: Record<string, any>,
) {
  const sheets = ydoc.getMap("sheets");

  ydoc.transact(() => {
    // Remove old sheet entirely
    sheets.delete(sheetId);

    // Create new sheet
    const newSheet = jsonToY(json);

    if (!(newSheet instanceof Y.Map)) {
      throw new Error("Sheet root must be an object");
    }

    sheets.set(sheetId, newSheet);
  });
}
