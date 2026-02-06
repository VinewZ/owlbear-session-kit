import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

const MESSAGE_UPDATE = 0;
const MESSAGE_SYNC_STEP_1 = 1;
const MESSAGE_SYNC_STEP_2 = 2;

const broadcast = (id: string, type: number, payload: Uint8Array) => {
  const message = { type, payload: Array.from(payload) };
  OBR.broadcast.sendMessage(id, message);
};

export function useYDoc(id: string): Y.Doc | null {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const persistence = new IndexeddbPersistence(id, doc);

    persistence.whenSynced.then(() => {
      setYdoc(doc);
      const stateVector = Y.encodeStateVector(doc);
      broadcast(id, MESSAGE_SYNC_STEP_1, stateVector);
    });

    const updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === persistence) {
        return;
      }
      broadcast(id, MESSAGE_UPDATE, update);
    };
    doc.on("update", updateHandler);

    const handleMessage = (event: { data: unknown; connectionId: string }) => {
      const { type, payload } = event.data as {
        type: number;
        payload: number[];
      };
      if (typeof type !== "number" || !payload) return;
      const data = new Uint8Array(payload);

      switch (type) {
        case MESSAGE_UPDATE:
          Y.applyUpdate(doc, data);
          break;
        case MESSAGE_SYNC_STEP_1: {
          const update = Y.encodeStateAsUpdate(doc, data);
          broadcast(id, MESSAGE_SYNC_STEP_2, update);
          break;
        }
        case MESSAGE_SYNC_STEP_2:
          Y.applyUpdate(doc, data);
          break;
      }
    };
    OBR.broadcast.onMessage(id, handleMessage);

    return () => {
      doc.off("update", updateHandler);
      persistence.destroy();
      doc.destroy();
      setYdoc(null);
    };
  }, [id]);

  return ydoc;
}
