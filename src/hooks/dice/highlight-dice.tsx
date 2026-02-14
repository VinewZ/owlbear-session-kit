import { useCallback } from "react";
import { DICE_REGEX } from "@/lib/constants";

export function useHighlightDice() {
	const highlight = useCallback((text: string): React.ReactNode[] => {
		if (!text) return [text];

		const result: React.ReactNode[] = [];
		let lastIndex = 0;

		for (const match of text.matchAll(DICE_REGEX)) {
			const index = match.index ?? 0;

			result.push(text.slice(lastIndex, index));

			result.push(
				<button
					key={`dice-${index}`}
					type="button"
					className="bg-[#BB99FF] text-white rounded px-1 py-0.5 cursor-pointer"
					onClick={(e) => {
						e.stopPropagation();
						alert(`Dice notation clicked: ${match[0]}`);
					}}
				>
					{match[0]}
				</button>,
			);

			lastIndex = index + match[0].length;
		}

		result.push(text.slice(lastIndex));

		return result;
	}, []);

	return highlight;
}
