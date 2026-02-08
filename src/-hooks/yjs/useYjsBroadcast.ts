
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef } from "react";
import * as Y from "yjs";

// Message types
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

interface UseYjsBroadcastResult {
  sendUpdate: (update: Uint8Array) => void;
  sendSyncStep1: (stateVector: Uint8Array) => void;
  sendSyncStep2: (update: Uint8Array) => void; // Added here
}

/**
 * Hook to manage Yjs broadcast messages over OBR.
 * It handles chunking, sending, and receiving Yjs updates and sync messages.
 */
export function useYjsBroadcast(
  roomId: string,
  doc: Y.Doc | null,
  applyUpdate: (update: Uint8Array) => void,
): UseYjsBroadcastResult {
  const applyUpdateRef = useRef(applyUpdate);

  // Update refs if functions change
  useEffect(() => {
    applyUpdateRef.current = applyUpdate;
  }, [applyUpdate]);

  // Setup OBR message listener
  useEffect(() => {
    if (!doc || !roomId) return;

    const handleMessage = (event: { data: unknown; connectionId: string }) => {
      const { type, payload } = event.data as {
        type: number;
        payload: number[];
      };
      if (typeof type !== "number" || !payload) return;

      const data = new Uint8Array(payload);

      switch (type) {
        case MESSAGE_UPDATE:
          applyUpdateRef.current(data);
          break;
        case MESSAGE_SYNC_STEP_1: {
          const update = Y.encodeStateAsUpdate(doc, data);
          broadcastChunked(roomId, MESSAGE_SYNC_STEP_2, update); // Use internal broadcastChunked
          break;
        }
        case MESSAGE_SYNC_STEP_2:
          applyUpdateRef.current(data);
          break;
      }
    };

    OBR.broadcast.onMessage(roomId, handleMessage);

  }, [roomId, doc]);

  const sendUpdate = (update: Uint8Array) => {
    broadcastChunked(roomId, MESSAGE_UPDATE, update);
  };

  const sendSyncStep1 = (stateVector: Uint8Array) => {
    broadcastChunked(roomId, MESSAGE_SYNC_STEP_1, stateVector);
  };

  const sendSyncStep2 = (update: Uint8Array) => { // Defined internally
    broadcastChunked(roomId, MESSAGE_SYNC_STEP_2, update);
  };

  return { sendUpdate, sendSyncStep1, sendSyncStep2 };
}
