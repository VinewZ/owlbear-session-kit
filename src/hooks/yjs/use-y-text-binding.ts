import { useEffect } from "react";
import { TextAreaBinding } from "y-textarea";
import type * as Y from "yjs";

export function useYTextBinding(
  ytext: Y.Text | null,
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
) {
  useEffect(() => {
    if (!ytext || !ref.current) return;

    const binding = new TextAreaBinding(ytext, ref.current);
    return () => binding.destroy();
  }, [ytext, ref]);
}
