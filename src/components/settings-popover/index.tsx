import { DarkMode, LightMode, Settings } from "@mui/icons-material";
import {
	Box,
	Divider,
	IconButton,
	MenuItem,
	Popover,
	Select,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDarkModeContext } from "@/components/theme-provider";

export function SettingsPopover() {
	const { t, i18n } = useTranslation();
	const { isDark, toggle } = useDarkModeContext();
	const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

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
				slotProps={{ paper: { className: "p-4 flex flex-col gap-4 min-w-48" } }}
			>
				<Typography variant="subtitle2" className="font-bold">
					{t("settings.title")}
				</Typography>

				<Divider />

				<Box className="flex flex-col gap-1">
					<Typography variant="caption" className="text-foreground/60">
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

				<Box className="flex flex-col gap-1">
					<Typography variant="caption" className="text-foreground/60">
						{t("settings.theme")}
					</Typography>
					<ToggleButtonGroup
						value={isDark ? "dark" : "light"}
						exclusive
						onChange={(_, val) => {
							if (val !== null && (val === "dark") !== isDark) toggle();
						}}
						size="small"
						fullWidth
					>
						<ToggleButton value="light" aria-label={t("settings.light")}>
							<LightMode fontSize="small" className="mr-1" />
							{t("settings.light")}
						</ToggleButton>
						<ToggleButton value="dark" aria-label={t("settings.dark")}>
							<DarkMode fontSize="small" className="mr-1" />
							{t("settings.dark")}
						</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			</Popover>
		</>
	);
}
