import { Box, Button, IconButton, Popover, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

type ColorPickerProps = {
	value: string;
	onChange: (color: string) => void;
	onClear?: () => void;
	label?: string;
};

export function ColorPicker({
	value,
	onChange,
	onClear,
	label,
}: ColorPickerProps) {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLButtonElement>(null);

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<IconButton
				ref={anchorRef}
				onClick={() => setOpen(true)}
				size="small"
				sx={{
					width: 32,
					height: 32,
					border: "1px solid",
					borderColor: "divider",
					bgcolor: value,
					"&:hover": { opacity: 0.8 },
				}}
			/>

			{label && (
				<Typography variant="caption" sx={{ color: "text.secondary" }}>
					{label}
				</Typography>
			)}

			{value && (
				<Typography variant="caption" sx={{ color: "text.disabled" }}>
					{value.toUpperCase()}
				</Typography>
			)}

			<Popover
				open={open}
				anchorEl={anchorRef.current}
				onClose={() => setOpen(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "left" }}
			>
				<Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
					<HexColorPicker
						color={value || "#000000"}
						onChange={onChange}
						style={{ width: 200, height: 150 }}
					/>

					{onClear && (
						<Button
							size="small"
							onClick={onClear}
							sx={{ alignSelf: "flex-end" }}
						>
							Reset
						</Button>
					)}
				</Box>
			</Popover>
		</Box>
	);
}
