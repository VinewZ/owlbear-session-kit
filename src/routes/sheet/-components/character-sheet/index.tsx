import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAccentColor } from "@/hooks/use-accent-color";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import { useSheetUpdater } from "@/hooks/use-sheet-updater";
import type { CharacterT } from "@/types";
import { AbilitiesPanel } from "./abilities-panel";
import { CombatPanel } from "./combat-panel";
import { Header } from "./header";
import { SidebarPanel } from "./sidebar-panel";

type CharacterSheetProps = {
	sheet: CharacterT;
	sheetId: string;
	update: (data: CharacterT) => void;
};

export function CharacterSheet({
	sheet,
	sheetId,
	update,
}: CharacterSheetProps) {
	const { accentColor } = useAccentColor();
	const updateField = useSheetUpdater(sheet, update);
	const theme = useTheme();
	const isWide = useMediaQuery(theme.breakpoints.up("md"));

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				overflow: "hidden",
				mb: 6,
			}}
		>
			<Header sheet={sheet} sheetId={sheetId} updateField={updateField} />
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: isWide ? "220px 1fr 220px" : "1fr",
					flex: 1,
					overflow: "hidden",
					"& > *:not(:last-child)": {
						borderRight: isWide ? 1 : 0,
						borderBottom: isWide ? 0 : 1,
						borderColor: accentColor,
					},
				}}
			>
				<AbilitiesPanel sheet={sheet} updateField={updateField} />
				<CombatPanel sheet={sheet} updateField={updateField} />
				<SidebarPanel sheet={sheet} updateField={updateField} />
			</Box>
		</Box>
	);
}

export type { UpdateFieldFn };
