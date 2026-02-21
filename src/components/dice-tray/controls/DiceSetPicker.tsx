import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { useId, useState } from "react";

import { diceSets } from "../sets/diceSets";
import { useDiceControlsStore } from "./store";

const PreviewImage = styled("img")({
	width: "32px",
	height: "32px",
});

export function DiceSetPicker() {
	const diceSet = useDiceControlsStore((state) => state.diceSet);
	const changeDiceSet = useDiceControlsStore((state) => state.changeDiceSet);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const diceSetButtonId = useId();
	const diceSetMenuId = useId();
	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		setAnchorEl(event.currentTarget);
	}
	function handleClose() {
		setAnchorEl(null);
	}

	return (
		<>
			<IconButton
				aria-label="change dice set"
				id={diceSetButtonId}
				aria-controls={open ? diceSetMenuId : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				onClick={handleClick}
				sx={{
					padding: "4px",
					backgroundColor: "rgba(255, 255, 255, 0.16) !important",
				}}
			>
				<PreviewImage src={diceSet.previewImage} />
			</IconButton>
			<Menu
				id={diceSetMenuId}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": diceSetButtonId,
				}}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
				sx={{ my: 1 }}
				marginThreshold={0}
			>
				<Stack gap={1} alignItems="center" p="2px">
					{diceSets.map((set) => (
						<IconButton
							key={set.id}
							aria-label={set.name}
							onClick={() => {
								changeDiceSet(set);
								handleClose();
							}}
							sx={{
								padding: "2px",
								backgroundColor:
									diceSet.id === set.id
										? "rgba(255, 255, 255, 0.16) !important"
										: undefined,
							}}
						>
							<PreviewImage src={set.previewImage} />
						</IconButton>
					))}
				</Stack>
			</Menu>
		</>
	);
}
