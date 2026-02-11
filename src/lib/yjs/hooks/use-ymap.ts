import * as Y from "yjs";
import { useSyncExternalStore } from "react";

export function useYMap<T extends Y.AbstractType<any>>(ymap: T): T {
  return useSyncExternalStore(
    (onStoreChange) => {
      ymap.observe(onStoreChange);
      return () => ymap.unobserve(onStoreChange);
    },
    () => ymap,
    () => ymap,
  );
}
