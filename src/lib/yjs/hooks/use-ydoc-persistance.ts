import { useEffect } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import type * as Y from "yjs";

export function useYDocPersistence(ydoc: Y.Doc, docName: string) {
  useEffect(() => {
    const persistence = new IndexeddbPersistence(docName, ydoc);

    return () => {
      persistence.destroy();
    };
  }, [ydoc, docName]);
}
