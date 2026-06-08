import type { Player } from "@owlbear-rodeo/sdk";
import { Dice as DefaultDice } from "../dice/Dice";
import { DiceRoll } from "../dice/DiceRoll";
import { usePlayerDice } from "./usePlayerDice";

export function PlayerDiceRoll({ player }: { player?: Player }) {
	const {
		diceRoll,
		rollThrows,
		finishedRollTransforms,
		finishedRolling,
		transformsRef,
	} = usePlayerDice(player);

	if (!diceRoll || !rollThrows || !finishedRollTransforms) {
		return null;
	}

	return (
		<DiceRoll
			roll={diceRoll}
			rollThrows={rollThrows}
			finishedTransforms={finishedRolling ? finishedRollTransforms : undefined}
			transformsRef={transformsRef}
			Dice={DefaultDice}
		/>
	);
}
