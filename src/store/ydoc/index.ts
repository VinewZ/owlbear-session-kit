import * as Y from "yjs";
import { create } from "zustand";
import type { CharacterT } from "@/hooks/pdf/parser";

const ydoc = new Y.Doc();

type SheetsDocT = {
  id: CharacterT;
};

export const useYDocStore = create(() => ({
  ydoc: ydoc,
  sheets: ydoc.getMap<SheetsDocT>("sheets"),
}));
