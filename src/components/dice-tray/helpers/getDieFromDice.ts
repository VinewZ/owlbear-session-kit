import type { Dice } from "../types/Dice";
import { isDice } from "../types/Dice";
import type { Die } from "../types/Die";
import { isDie } from "../types/Die";

/** Recursively get all the die from a dice representation */
export function getDieFromDice(diceRoll: Dice): Die[] {
	const dieArray: Die[] = [];
	for (const dieOrDice of diceRoll.dice) {
		if (isDie(dieOrDice)) {
			dieArray.push(dieOrDice);
		} else if (isDice(dieOrDice)) {
			dieArray.push(...getDieFromDice(dieOrDice));
		}
	}

	return dieArray;
}
