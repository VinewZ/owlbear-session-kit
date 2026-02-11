import OBR from "@owlbear-rodeo/sdk";
import * as Y from "yjs";
import { MAIN_BROADCAST_CHANNEL } from "../constants";

export const globalYDoc = new Y.Doc();

let applyingRemote = false;
let hasSynced = false;

/* receive updates */
OBR.broadcast.onMessage(MAIN_BROADCAST_CHANNEL, (event) => {
  const { update } = event.data as { update: number[] };

  applyingRemote = true;
  Y.applyUpdate(globalYDoc, new Uint8Array(update));
  applyingRemote = false;
});

/* send incremental updates */
globalYDoc.on("update", (update) => {
  if (applyingRemote) return;

  OBR.broadcast.sendMessage(MAIN_BROADCAST_CHANNEL, {
    update: Array.from(update),
  });
});

/* 🔴 ONE-TIME full sync */
OBR.onReady(() => {
  if (hasSynced) return;
  hasSynced = true;

  const snapshot = Y.encodeStateAsUpdate(globalYDoc);

  OBR.broadcast.sendMessage(MAIN_BROADCAST_CHANNEL, {
    update: Array.from(snapshot),
  });
});
