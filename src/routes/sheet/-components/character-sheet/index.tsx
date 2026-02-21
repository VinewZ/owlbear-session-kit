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

export type { UpdateFieldFn };
