import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import { useSheetUpdater } from "@/hooks/use-sheet-updater";
import type { CharacterT } from "@/types";
import { AbilitiesPanel } from "./abilities-panel";
import { CombatPanel } from "./combat-panel";
import { Header } from "./header";
import { SidebarPanel } from "./sidebar-panel";
import { Box } from "@mui/material";
import { useAccentColor } from "@/hooks/use-accent-color";

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

  return (
    <Box className="flex flex-col h-full overflow-hidden mb-12">
      <Header sheet={sheet} sheetId={sheetId} updateField={updateField} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 220px",
          flex: 1,
          overflow: "hidden",
          "& > *:not(:last-child)": {
            borderRight: 1,
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
