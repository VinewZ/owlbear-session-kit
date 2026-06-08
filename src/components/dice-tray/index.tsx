import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import "simplebar-react/dist/simplebar.min.css";

import { DICE_BROADCAST_CHANNEL } from "@/lib/constants";
import { parseDiceNotation } from "@/lib/dice/parse-notation";
import { DiceHistoryView } from "./controls/DiceHistory";
import {
	destroyRollHistory,
	initRollHistory,
} from "./controls/roll-history-store";
import { Sidebar } from "./controls/Sidebar";
import { useDiceControlsStore } from "./controls/store";
import { useDiceRollStore } from "./dice/store";
import { DiceRollSync } from "./plugin/DiceRollSync";
import { ResizeObserver as DiceResizeObserver } from "./plugin/ResizeObserver";
import { InteractiveTray } from "./tray/InteractiveTray";

type DiceRollMessage = {
	type: "ROLL_DICE";
	notation: string;
};

export function DiceTray() {
	const [showHistory, setShowHistory] = useState(false);

	useEffect(() => {
		const channel = new BroadcastChannel(DICE_BROADCAST_CHANNEL);
		channel.onmessage = (event: MessageEvent<DiceRollMessage>) => {
			if (event.data?.type === "ROLL_DICE") {
				const controlsState = useDiceControlsStore.getState();
				const style = controlsState.diceSet.dice[0]?.style ?? "IRON";
				const roll = parseDiceNotation(event.data.notation, style);
				if (roll) {
					OBR.action.open();
					useDiceRollStore.getState().startRoll(roll);
				}
			}
		};
		return () => channel.close();
	}, []);

	useEffect(() => {
		initRollHistory();
		return () => destroyRollHistory();
	}, []);

	return (
		<Container disableGutters className="bg-[#313442]">
			<Stack direction="row" justifyContent="left">
				<Sidebar showHistory={showHistory} setShowHistory={setShowHistory} />
				{showHistory ? <DiceHistoryView /> : <InteractiveTray />}
			</Stack>
			<DiceRollSync />
			<DiceResizeObserver />
		</Container>
	);
}
