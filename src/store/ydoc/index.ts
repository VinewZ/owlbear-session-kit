import { create } from "zustand";
import * as Y from "yjs";

const ydoc = new Y.Doc();

export const useYDocStore = create(() => ({
  ydoc: ydoc,
}));
