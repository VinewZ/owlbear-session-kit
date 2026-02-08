import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState, useCallback } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { useYjsBroadcast } from "./useYjsBroadcast";

/**
 * Yjs hook with automatic chunked broadcast
 */
export function useYDoc(roomId: string): Y.Doc | null {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  const applyUpdate = useCallback((update: Uint8Array) => {
    if (ydoc) {
      Y.applyUpdate(ydoc, update);
    }
  }, [ydoc]);

  const { sendUpdate, sendSyncStep1 } = useYjsBroadcast(
    roomId,
    ydoc,
    applyUpdate,
  );

  useEffect(() => {
    const doc = new Y.Doc();
    const persistence = new IndexeddbPersistence(roomId, doc);

    // Send initial sync after persistence
    persistence.whenSynced.then(() => {
      setYdoc(doc);
      const stateVector = Y.encodeStateVector(doc);
      sendSyncStep1(stateVector);
    });

    // Send updates (chunked)
    const updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === persistence) return;
      sendUpdate(update);
    };
    doc.on("update", updateHandler);

    return () => {
      doc.off("update", updateHandler);
      persistence.destroy();
      doc.destroy();
      setYdoc(null);
    };
  }, [roomId, sendUpdate, sendSyncStep1]);

  return ydoc;
}
