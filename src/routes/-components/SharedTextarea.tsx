import { useCallback, useEffect, useRef } from "react";
import type * as Y from "yjs";
import { useYDoc } from "../../-hooks/yjs/useYDoc";

const INPUT_ORIGIN = "input";

interface SharedTextareaProps {
  docId: string;
  valueName: string;
}

export function SharedTextarea({ docId, valueName }: SharedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ydoc = useYDoc(docId);

  const getYText = useCallback(
    (doc: Y.Doc) => doc.getText(valueName),
    [valueName],
  );
  const ytext = ydoc ? getYText(ydoc) : null;

  useEffect(() => {
    if (!ytext || !textareaRef.current) return;

    const textarea = textareaRef.current;

    const observer = (event: Y.YTextEvent) => {
      if (event.transaction.origin !== INPUT_ORIGIN) {
        const { selectionStart, selectionEnd, selectionDirection } = textarea;
        textarea.value = ytext.toString();
        if (document.activeElement === textarea) {
          textarea.setSelectionRange(
            selectionStart,
            selectionEnd,
            selectionDirection,
          );
        }
      }
    };

    ytext.observe(observer);
    textarea.value = ytext.toString();

    return () => ytext.unobserve(observer);
  }, [ytext]);

  const onInput = () => {
    if (!textareaRef.current || !ydoc || !ytext) return;

    const value = textareaRef.current.value;
    const current = ytext.toString();
    if (value === current) return;

    ydoc.transact(() => {
      const prev = ytext.toString();
      let start = 0;
      while (
        start < prev.length &&
        start < value.length &&
        prev[start] === value[start]
      ) {
        start++;
      }
      let endPrev = prev.length - 1;
      let endNext = value.length - 1;
      while (
        endPrev >= start &&
        endNext >= start &&
        prev[endPrev] === value[endNext]
      ) {
        endPrev--;
        endNext--;
      }
      if (endPrev >= start) {
        ytext.delete(start, endPrev - start + 1);
      }
      if (endNext >= start) {
        ytext.insert(start, value.slice(start, endNext + 1));
      }
    }, INPUT_ORIGIN);
  };

  return (
    <textarea
      ref={textareaRef}
      rows={6}
      onInput={onInput}
      placeholder="Shared text..."
      className="border w-full p-2 disabled:bg-gray-100"
      disabled={!ytext}
    />
  );
}
