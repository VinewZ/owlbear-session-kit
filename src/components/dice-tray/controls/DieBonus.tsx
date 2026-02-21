import IncreaseIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DecreaseIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";

type DieBonusProps = {
	bonus: number;
	onChange: (bonus: number) => void;
	onIncrease: () => void;
	onDecrease: () => void;
};

export function DieBonus({
	bonus,
	onChange,
	onIncrease,
	onDecrease,
}: DieBonusProps) {
	const [bonusString, setBonusString] = useState(`${bonus}`);

	useEffect(() => {
		setBonusString(`${bonus}`);
	}, [bonus]);

	return (
		<ListItem disablePadding>
			<ListItemButton sx={{ cursor: "inherit" }}>
				<ListItemIcon sx={{ minWidth: "38px", justifyContent: "center" }}>
					+/-
				</ListItemIcon>
				<ListItemText sx={{ marginRight: "88px" }}>
					<Input
						disableUnderline
						inputProps={{
							sx: {
								textAlign: "center",
							},
						}}
						value={bonusString}
						onChange={(e) => {
							setBonusString(e.target.value);
							const newBonus = parseInt(e.target.value, 10);
							if (!Number.isNaN(newBonus)) {
								onChange(newBonus);
							}
						}}
						onBlur={(e) => {
							const currentBonus = parseInt(e.target.value, 10);
							if (Number.isNaN(currentBonus)) {
								onChange(0);
								setBonusString("0");
							}
						}}
						fullWidth
					/>
				</ListItemText>
				<ListItemSecondaryAction>
					<Stack gap={1} direction="row">
						<IconButton
							aria-label="decrease bonus"
							onClick={() => onDecrease()}
						>
							<DecreaseIcon />
						</IconButton>
						<IconButton
							aria-label="increase bonus"
							onClick={() => onIncrease()}
						>
							<IncreaseIcon />
						</IconButton>
					</Stack>
				</ListItemSecondaryAction>
			</ListItemButton>
		</ListItem>
	);
}
