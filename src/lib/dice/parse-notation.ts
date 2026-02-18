import { generateDiceId } from "@/components/dice-tray/helpers/generateDiceId";
import type { DiceRoll } from "@/components/dice-tray/types/DiceRoll";
import type { DiceStyle } from "@/components/dice-tray/types/DiceStyle";
import type { DiceType } from "@/components/dice-tray/types/DiceType";

const DIE_TYPE_MAP: Partial<Record<number, DiceType>> = {
	4: "D4",
	6: "D6",
	8: "D8",
	10: "D10",
	12: "D12",
	20: "D20",
	100: "D100",
};

/**
 * Parse a dice notation string like "2d6+3" or "1d20" into a DiceRoll
 * compatible with the dice tray's Zustand store.
 *
 * @param notation - The dice notation string (e.g., "2d6+3")
 * @param style - The dice style/skin to use (e.g., "IRON", "GALAXY")
 * @returns DiceRoll object or null if invalid notation
 */
export function parseDiceNotation(
	notation: string,
	style: DiceStyle,
): DiceRoll | null {
	const match = notation.toLowerCase().match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/);
	if (!match) return null;

	const count = Number.parseInt(match[1], 10);
	const faces = Number.parseInt(match[2], 10);
	const bonusSign = match[3];
	const bonusAbs = match[4] ? Number.parseInt(match[4], 10) : 0;

	const diceType = DIE_TYPE_MAP[faces];
	if (!diceType) return null;
	if (count < 1) return null;

	const bonus =
		bonusSign === "-" ? -bonusAbs : bonusSign === "+" ? bonusAbs : 0;

	const dice = Array.from({ length: count }, () => ({
		id: generateDiceId(),
		style,
		type: diceType,
	}));

	return {
		dice,
		...(bonus !== 0 ? { bonus } : {}),
	};
}
