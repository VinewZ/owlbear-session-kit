import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import type { Dispatch, SetStateAction } from "react";
import { DiceExtras } from "./DiceExtras";
import { DiceHidden } from "./DiceHidden";
import { DiceHistory } from "./DiceHistory";
import { DicePicker } from "./DicePicker";
import { DiceSetPicker } from "./DiceSetPicker";

type SidebarPropsT = {
	showHistory: boolean;
	setShowHistory: Dispatch<SetStateAction<boolean>>;
};

export function Sidebar({ showHistory, setShowHistory }: SidebarPropsT) {
	return (
		<Stack p={1} gap={1} alignItems="center">
			<DiceSetPicker />
			<Divider flexItem sx={{ mx: 1 }} />
			<DicePicker />
			<Divider flexItem sx={{ mx: 1 }} />
			<DiceHidden />
			<DiceExtras />
			<DiceHistory showHistory={showHistory} setShowHistory={setShowHistory} />
		</Stack>
	);
}
