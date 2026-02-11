import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { useChunkedBroadcast } from "@/hooks/obr/use-chunked-broadcast";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { logger } from "@/lib/utils";
import type { YjsMessage } from "../types";

export function useYDocBroadcast(ydoc: Y.Doc) {
  const applyingRemote = useRef(false);

  const { sendMessage, listenMessage } = useChunkedBroadcast();

  useEffect(() => {
    /* ---- send incremental updates ---- */
    const onLocalUpdate = (update: Uint8Array) => {
      if (applyingRemote.current) return;

      const msg: YjsMessage = {
        type: "update",
        update: Array.from(update),
      };

      sendMessage({
        channel: MAIN_BROADCAST_CHANNEL,
        message: JSON.stringify(msg),
      });
    };

    ydoc.on("update", onLocalUpdate);

    /* ---- receive messages ---- */
    const unsubscribe = listenMessage({
      channel: MAIN_BROADCAST_CHANNEL,
      onMessage: (raw) => {
        const parsedMsg = JSON.parse(raw);
        const msg = parsedMsg as YjsMessage;
        switch (msg.type) {
          case "sync-request": {
            const full = Y.encodeStateAsUpdate(ydoc);

            sendMessage({
              channel: MAIN_BROADCAST_CHANNEL,
              message: JSON.stringify({
                type: "sync-response",
                update: Array.from(full),
              }),
            });

            break;
          }

          case "sync-response": {
            applyingRemote.current = true;
            Y.applyUpdate(ydoc, new Uint8Array(msg.update));
            applyingRemote.current = false;

            break;
          }

          case "update": {
            applyingRemote.current = true;
            Y.applyUpdate(ydoc, new Uint8Array(msg.update));
            applyingRemote.current = false;
            break;
          }
        }
      },
    });

    /* ---- request initial sync ---- */
    sendMessage({
      channel: MAIN_BROADCAST_CHANNEL,
      message: JSON.stringify({ type: "sync-request" }),
    });

    return () => {
      ydoc.off("update", onLocalUpdate);
      unsubscribe();
    };
  }, [ydoc, sendMessage, listenMessage]);
}
