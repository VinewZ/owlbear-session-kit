import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import type { YjsMessage } from "../types";

export function useYDocBroadcast(ydoc: Y.Doc) {
  const applyingRemote = useRef(false);
  const synced = useRef(false);

  useEffect(() => {
    /* ---- send incremental updates ---- */
    const onLocalUpdate = (update: Uint8Array) => {
      if (applyingRemote.current) return;

      const msg: YjsMessage = {
        type: "update",
        update: Array.from(update),
      };

      OBR.broadcast.sendMessage(MAIN_BROADCAST_CHANNEL, msg);
    };

    ydoc.on("update", onLocalUpdate);

    /* ---- receive messages ---- */
    const unsubscribe = OBR.broadcast.onMessage(
      MAIN_BROADCAST_CHANNEL,
      (event) => {
        const msg = event.data as YjsMessage;

        switch (msg.type) {
          case "sync-request": {
            if (synced.current) return;

            const full = Y.encodeStateAsUpdate(ydoc);

            OBR.broadcast.sendMessage(MAIN_BROADCAST_CHANNEL, {
              type: "sync-response",
              update: Array.from(full),
            });

            synced.current = true;
            break;
          }

          case "sync-response": {
            if (synced.current) return;

            applyingRemote.current = true;
            Y.applyUpdate(ydoc, new Uint8Array(msg.update));
            applyingRemote.current = false;

            synced.current = true;
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
    );

    /* ---- request initial sync ---- */
    OBR.broadcast.sendMessage(MAIN_BROADCAST_CHANNEL, {
      type: "sync-request",
    });

    return () => {
      ydoc.off("update", onLocalUpdate);
      unsubscribe();
    };
  }, [ydoc]);
}
