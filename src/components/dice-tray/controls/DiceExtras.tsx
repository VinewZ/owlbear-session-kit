import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { useId, useState } from "react";
import { useDiceRollStore } from "../dice/store";
import { DieAdvantage } from "./DieAdvantage";
import { DieBonus } from "./DieBonus";
import { useDiceControlsStore } from "./store";

export function DiceExtras() {
	const bonus = useDiceControlsStore((state) => state.diceBonus);
	const setBonus = useDiceControlsStore((state) => state.setDiceBonus);
	const advantage = useDiceControlsStore((state) => state.diceAdvantage);
	const setAdvantage = useDiceControlsStore((state) => state.setDiceAdvantage);

	const clearRoll = useDiceRollStore((state) => state.clearRoll);
	const roll = useDiceRollStore((state) => state.roll);
	function clearRollIfNeeded() {
		if (roll) {
			clearRoll();
		}
	}

	/** Controls (bonus and adv/dis) */
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const moreButtonId = useId();
	const moreMenuId = useId();
	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		setAnchorEl(event.currentTarget);
	}
	function handleClose() {
		setAnchorEl(null);
	}

	return (
		<>
			<Tooltip title="Bonus" placement="top" disableInteractive>
				<IconButton
					aria-label="more"
					id={moreButtonId}
					aria-controls={open ? moreMenuId : undefined}
					aria-haspopup="true"
					aria-expanded={open ? "true" : undefined}
					onClick={handleClick}
					sx={{ fontSize: "18px" }}
				>
					<span className="size-6 text-white">+/-</span>
				</IconButton>
			</Tooltip>
			<Menu
				id={moreMenuId}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": moreButtonId,
				}}
				anchorOrigin={{
					vertical: "center",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "center",
					horizontal: "left",
				}}
			>
				<Stack>
					<DieBonus
						bonus={bonus}
						onChange={(bonus) => {
							setBonus(bonus);
							clearRollIfNeeded();
						}}
						onIncrease={() => {
							setBonus(bonus + 1);
							clearRollIfNeeded();
						}}
						onDecrease={() => {
							setBonus(bonus - 1);
							clearRollIfNeeded();
						}}
					/>
					<Divider variant="middle" />
					<DieAdvantage
						advantage={advantage}
						onChange={(advantage) => {
							setAdvantage(advantage);
							clearRollIfNeeded();
						}}
					/>
				</Stack>
			</Menu>
		</>
	);
}
