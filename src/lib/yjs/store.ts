import { create } from "zustand";
import { globalYDoc } from "./global-doc";

export const useYDocStore = create(() => ({
  ydoc: globalYDoc,
  sheets: globalYDoc.getMap("sheets"),
}));
