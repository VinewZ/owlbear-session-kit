import { Delete, Settings } from "@mui/icons-material";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	MenuItem,
	Popover,
	Select,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ColorPicker } from "@/components/color-picker";
import { useAccentColor } from "@/hooks/use-accent-color";

interface SettingsPopoverProps {
	onDelete?: () => void;
}

export function SettingsPopover({ onDelete }: SettingsPopoverProps) {
	const { t, i18n } = useTranslation();
	const { accentColor, saveAccentColor, clearAccentColor } = useAccentColor();
	const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
		setAnchor(e.currentTarget);
	}

	function handleClose() {
		setAnchor(null);
	}

	const open = Boolean(anchor);

	return (
		<>
			<IconButton
				onClick={handleOpen}
				size="small"
				aria-label={t("settings.title")}
			>
				<Settings fontSize="small" />
			</IconButton>

			<Popover
				open={open}
				anchorEl={anchor}
				onClose={handleClose}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				transformOrigin={{ vertical: "bottom", horizontal: "center" }}
				slotProps={{
					paper: {
						sx: {
							p: 2,
							display: "flex",
							flexDirection: "column",
							gap: 2,
							minWidth: 200,
						},
					},
				}}
			>
				<Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
					{t("settings.title")}
				</Typography>

				<Divider />

				<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
					<Typography variant="caption" sx={{ color: "text.secondary" }}>
						{t("settings.language")}
					</Typography>
					<Select
						value={i18n.language}
						onChange={(e) => i18n.changeLanguage(e.target.value)}
						size="small"
						fullWidth
					>
						<MenuItem value="en">English</MenuItem>
						<MenuItem value="pt-BR">Português (Brasil)</MenuItem>
					</Select>
				</Box>

				<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
					<Typography variant="caption" sx={{ color: "text.secondary" }}>
						{t("settings.accentColor")}
					</Typography>
					{accentColor && (
						<ColorPicker
							value={accentColor}
							onChange={saveAccentColor}
							onClear={clearAccentColor}
						/>
					)}
				</Box>

				<Divider />

				<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
					<Typography variant="caption" sx={{ color: "text.secondary" }}>
						{t("settings.dangerZone")}
					</Typography>
					<Button
						color="error"
						variant="outlined"
						size="small"
						startIcon={<Delete />}
						onClick={() => setDeleteDialogOpen(true)}
						fullWidth
					>
						{t("settings.deleteSheet")}
					</Button>
				</Box>
			</Popover>

			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>{t("settings.deleteConfirmTitle")}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{t("settings.deleteConfirmMessage")}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>
						{t("settings.cancel")}
					</Button>
					<Button
						color="error"
						variant="contained"
						onClick={async () => {
							setDeleteDialogOpen(false);
							handleClose();
							onDelete?.();
						}}
					>
						{t("settings.delete")}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
