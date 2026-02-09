import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { base64ToUint8Array, uint8ArrayToBase64 } from "@/lib/chunker";
import { useChunkedBroadcast } from "@/lib/yjs/use-chunked-broadcast";
import { logger } from "@/lib/utils";

type Props = {
  ydoc: Y.Doc;
  docId: string;
  broadcastChannel: string;
};
type SyncMessage =
  | { type: "request-sync"; docId: string }
  | { type: "sync-state"; docId: string; update: string };

export function useYDocFullSync({ ydoc, docId, broadcastChannel }: Props) {
  const { sendMessage, listenMessage } = useChunkedBroadcast();

  const [isSynced, setIsSynced] = useState(false);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // 1. Listen for sync messages
    const unsubscribe = listenMessage({
      channel: broadcastChannel,
      onMessage: (raw) => {
        let msg: SyncMessage;
        try {
          msg = JSON.parse(raw);
        } catch {
          logger.warn("Received non-JSON message on sync channel, ignoring");
          return;
        }

        if (msg.docId !== docId) return;

        // Someone asks for state → respond
        if (msg.type === "request-sync") {
          const update = Y.encodeStateAsUpdate(ydoc);

          sendMessage({
            channel: broadcastChannel,
            message: JSON.stringify({
              type: "sync-state",
              docId,
              update: uint8ArrayToBase64(update),
            }),
          });
        }

        // We receive full state → apply
        if (msg.type === "sync-state") {
          const update = base64ToUint8Array(msg.update);
          Y.applyUpdate(ydoc, update, "remote");
          setIsSynced(true);
        }
      },
    });

    return unsubscribe;
  }, [ydoc, docId, broadcastChannel, sendMessage, listenMessage]);

  useEffect(() => {
    // 2. Request sync once on mount
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    sendMessage({
      channel: broadcastChannel,
      message: JSON.stringify({
        type: "request-sync",
        docId,
      }),
    });

    setIsSynced(false);
  }, [docId, broadcastChannel, sendMessage]);

  return { isSynced };
}
