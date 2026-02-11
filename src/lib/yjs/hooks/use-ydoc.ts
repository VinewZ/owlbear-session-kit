import { useRef } from "react";
import * as Y from "yjs";
import { useYDocBroadcast } from "./use-ydoc-broadcast";
import { useYDocPersistence } from "./use-ydoc-persistance";

const DOC_NAME = "global-ydoc"; // must be stable

export function useYDoc() {
  const ref = useRef<Y.Doc | null>(null);

  if (!ref.current) {
    ref.current = new Y.Doc();
  }

  useYDocPersistence(ref.current, DOC_NAME);
  useYDocBroadcast(ref.current);

  return ref.current;
}
