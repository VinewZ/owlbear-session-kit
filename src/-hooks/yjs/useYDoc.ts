import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

const MESSAGE_UPDATE = 0;
const MESSAGE_SYNC_STEP_1 = 1;
const MESSAGE_SYNC_STEP_2 = 2;

// Chunking configuration
const SAFE_CHUNK_SIZE = 12 * 1024; // Leave headroom for metadata

/**
 * Split a Uint8Array into chunks
 */
function chunkArray(arr: Uint8Array, chunkSize: number) {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Broadcast a payload in chunks
 */
function broadcastChunked(roomId: string, type: number, payload: Uint8Array) {
  const chunks = chunkArray(payload, SAFE_CHUNK_SIZE);

  // Send each chunk as a separate message
  for (const chunk of chunks) {
    OBR.broadcast.sendMessage(roomId, { type, payload: Array.from(chunk) });
  }
}

/**
 * Yjs hook with automatic chunked broadcast
 */
export function useYDoc(roomId: string): Y.Doc | null {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const persistence = new IndexeddbPersistence(roomId, doc);

    // Send initial sync after persistence
    persistence.whenSynced.then(() => {
      setYdoc(doc);
      const stateVector = Y.encodeStateVector(doc);
      broadcastChunked(roomId, MESSAGE_SYNC_STEP_1, stateVector);
    });

    // Send updates (chunked)
    const updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === persistence) return;
      broadcastChunked(roomId, MESSAGE_UPDATE, update);
    };
    doc.on("update", updateHandler);

    // Handle incoming messages
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
          broadcastChunked(roomId, MESSAGE_SYNC_STEP_2, update);
          break;
        }
        case MESSAGE_SYNC_STEP_2:
          Y.applyUpdate(doc, data);
          break;
      }
    };
    OBR.broadcast.onMessage(roomId, handleMessage);

    return () => {
      doc.off("update", updateHandler);
      persistence.destroy();
      doc.destroy();
      setYdoc(null);
    };
  }, [roomId]);

  return ydoc;
}
