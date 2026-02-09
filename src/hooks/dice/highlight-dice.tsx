import { DICE_REGEX } from "@/lib/constants";
import { useCallback } from "react";

export function useHighlightDice() {
  const highlight = useCallback((text: string): React.ReactNode[] => {
    if (!text) return [text];

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(DICE_REGEX)) {
      const index = match.index ?? 0;

      result.push(text.slice(lastIndex, index));

      result.push(
        <span
          key={`dice-${index}`}
          className="bg-[#BB99FF] text-white rounded px-1 py-0.5"
        >
          {match[0]}
        </span>,
      );

      lastIndex = index + match[0].length;
    }

    result.push(text.slice(lastIndex));

    return result;
  }, []);

  return highlight;
}
