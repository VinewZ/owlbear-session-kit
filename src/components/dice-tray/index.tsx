import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect } from "react";
import "simplebar-react/dist/simplebar.min.css";

import { DICE_BROADCAST_CHANNEL } from "@/lib/constants";
import { parseDiceNotation } from "@/lib/dice/parse-notation";
import { Sidebar } from "./controls/Sidebar";
import { useDiceControlsStore } from "./controls/store";
import { useDiceRollStore } from "./dice/store";
import { DiceRollSync } from "./plugin/DiceRollSync";
import { PartyTrays } from "./plugin/PartyTrays";
import { ResizeObserver as DiceResizeObserver } from "./plugin/ResizeObserver";
import { InteractiveTray } from "./tray/InteractiveTray";

type DiceRollMessage = {
	type: "ROLL_DICE";
	notation: string;
};

export function DiceTray() {
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

	return (
		<Container disableGutters maxWidth="md" className="bg-[#313442]">
			<Stack direction="row" justifyContent="center">
				<Sidebar />
				<InteractiveTray />
			</Stack>
			<PartyTrays />
			<DiceRollSync />
			<DiceResizeObserver />
		</Container>
	);
}
