import { useEffect, useRef } from "react";
import { TextAreaBinding } from "y-textarea";
import * as Y from "yjs";
import { base64ToUint8Array, uint8ArrayToBase64 } from "@/lib/chunker";
import { useChunkedBroadcast } from "@/lib/yjs/use-chunked-broadcast";
import { IndexeddbPersistence } from "y-indexeddb";

type UseYDocPropsT = {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  yjsDocName: string;
  broadcastChannel: string;
};

type UseYDocReturnT = Y.Doc;

export function useYDoc({
  ref,
  yjsDocName,
  broadcastChannel,
}: UseYDocPropsT): UseYDocReturnT {
  const { sendMessage, listenMessage } = useChunkedBroadcast();

  // Stable Yjs instances
  const ydocRef = useRef<Y.Doc>(null);
  const ytextRef = useRef<Y.Text>(null);

  if (!ydocRef.current) {
    const doc = new Y.Doc();
    ydocRef.current = doc;
    ytextRef.current = doc.getText(yjsDocName);
  }

  const ydoc = ydocRef.current;
  const ytext = ytextRef.current;

  // Bind textarea <-> Y.Text
  useEffect(() => {
    if (!ref.current || !ytext) return;

    const binding = new TextAreaBinding(ytext, ref.current);
    return () => binding.destroy();
  }, [ref, ytext]);

  // Broadcast sync
  useEffect(() => {
    const unsubscribe = listenMessage({
      channel: `${broadcastChannel}-yjs`,
      onMessage: (base64Message) => {
        const update = base64ToUint8Array(base64Message);
        Y.applyUpdate(ydoc, update, "remote");
      },
    });

    const observer = (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;

      const base64Message = uint8ArrayToBase64(update);
      sendMessage({
        channel: `${broadcastChannel}-yjs`,
        message: base64Message,
      });
    };

    ydoc.on("update", observer);

    return () => {
      unsubscribe();
      ydoc.off("update", observer);
    };
  }, [broadcastChannel, sendMessage, listenMessage, ydoc]);

  useEffect(() => {
    const persistence = new IndexeddbPersistence(`${yjsDocName}-yjs`, ydoc);

    return () => {
      persistence.destroy();
    };
  }, [ydoc, yjsDocName]);

  // Destroy once on unmount
  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

  return ydoc;
}
