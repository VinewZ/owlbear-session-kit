import type { CharacterT } from "@/hooks/pdf/parser";
import { AbilitiesPanel } from "./abilities-panel";
import { CombatPanel } from "./combat-panel";
import { Header } from "./header";
import { SidebarPanel } from "./sidebar-panel";
import { useSheetUpdater } from "./use-sheet-updater";

type CharacterSheetPropsT = {
	sheet: CharacterT;
	sheetId: string;
	update: (data: CharacterT) => void;
};

export function CharacterSheet({
	sheet,
	sheetId,
	update,
}: CharacterSheetPropsT) {
	const updateField = useSheetUpdater(sheet, update);

	return (
		<div className="flex flex-col h-full overflow-hidden mb-12">
			<Header sheet={sheet} sheetId={sheetId} updateField={updateField} />
			<div className="grid grid-cols-[220px_1fr_220px] divide-x divide-border flex-1 overflow-hidden">
				<AbilitiesPanel sheet={sheet} updateField={updateField} />
				<CombatPanel sheet={sheet} updateField={updateField} />
				<SidebarPanel sheet={sheet} updateField={updateField} />
			</div>
		</div>
	);
}
