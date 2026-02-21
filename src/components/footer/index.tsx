import { CloseFullscreen, OpenInFull } from "@mui/icons-material";
import { Box, Button, Grid } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsPopover } from "@/components/settings-popover";
import { DEFAULT_SHEET_POPOVER_SIZE, SHEET_POPOVER_ID } from "@/lib/constants";

export function Footer() {
	const [isMinimized, setIsMinimized] = useState(false);
	const { t } = useTranslation();

	async function closeSheet() {
		await OBR.popover.close(SHEET_POPOVER_ID);
	}

	async function handleSizeSheet() {
		if (isMinimized) {
			await Promise.all([
				OBR.popover.setHeight(
					SHEET_POPOVER_ID,
					DEFAULT_SHEET_POPOVER_SIZE.height,
				),
				OBR.popover.setWidth(
					SHEET_POPOVER_ID,
					DEFAULT_SHEET_POPOVER_SIZE.width,
				),
			]);
			setIsMinimized((prev) => !prev);
		} else {
			await Promise.all([
				OBR.popover.setHeight(SHEET_POPOVER_ID, 45),
				OBR.popover.setWidth(SHEET_POPOVER_ID, 250),
			]);
			setIsMinimized((prev) => !prev);
		}
	}

	return (
		<Grid
			container
			className="h-12 items-center justify-between fixed bottom-0 left-0 right-0 border-t-2 border-primary bg-card dark:bg-primary-foreground"
		>
			<Box className="flex items-center">
				<Button
					onClick={handleSizeSheet}
					className="rounded-lg transition hover:opacity-90"
				>
					{isMinimized ? (
						<OpenInFull color="action" />
					) : (
						<CloseFullscreen color="action" />
					)}
				</Button>
				{!isMinimized && <SettingsPopover />}
			</Box>

			<Button
				onClick={closeSheet}
				className="bg-primary text-primary-foreground rounded-lg px-4 py-2 mr-4 transition hover:opacity-90"
			>
				{t("footer.close")}
			</Button>
		</Grid>
	);
}
