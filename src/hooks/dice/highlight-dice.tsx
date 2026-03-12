import { useCallback } from "react";
import { DICE_BROADCAST_CHANNEL } from "@/lib/constants";
import { useAccentColor } from "../use-accent-color";

const DICE_REGEX = /\b[1-9]\d*[dD](?:4|6|8|10|12|20|100)(?:[+-]\d+)?\b/g;

export function useHighlightDice() {
	const { accentColor } = useAccentColor();
	const highlight = useCallback(
		(text: string): React.ReactNode[] => {
			if (!text) return [text];

			const result: React.ReactNode[] = [];
			let lastIndex = 0;

			for (const match of text.matchAll(DICE_REGEX)) {
				const index = match.index ?? 0;
				const notation = match[0];

				result.push(text.slice(lastIndex, index));

				result.push(
					<button
						key={`dice-${index}`}
						type="button"
						className="text-white rounded px-1 py-0.5 cursor-pointer"
						style={{ background: accentColor }}
						onClick={(e) => {
							e.stopPropagation();
							const channel = new BroadcastChannel(DICE_BROADCAST_CHANNEL);
							channel.postMessage({ type: "ROLL_DICE", notation });
							channel.close();
						}}
					>
						{notation}
					</button>,
				);

				lastIndex = index + notation.length;
			}

			result.push(text.slice(lastIndex));

			return result;
		},
		[accentColor],
	);

	return highlight;
}
