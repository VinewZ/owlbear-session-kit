import type { CharacterT } from "@/types";

export type UpdateFieldFn = (path: (string | number)[], value: unknown) => void;

export function useSheetUpdater(
	sheet: CharacterT,
	update: (data: CharacterT) => void,
): UpdateFieldFn {
	return (path, value) => {
		const newSheet = JSON.parse(JSON.stringify(sheet)) as CharacterT;
		let current: Record<string, unknown> = newSheet as unknown as Record<
			string,
			unknown
		>;
		for (let i = 0; i < path.length - 1; i++) {
			if (!current[path[i] as string]) current[path[i] as string] = {};
			current = current[path[i] as string] as Record<string, unknown>;
		}
		current[path[path.length - 1] as string] = value;
		update(newSheet);
	};
}
