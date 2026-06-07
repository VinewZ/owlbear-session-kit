import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import OBR from "@owlbear-rodeo/sdk";
import { deleteSheet, getSheet, saveSheet } from "@/lib/storage/supabase";
import type { CharacterT, PlayerInfo } from "@/types";

async function getModifier(): Promise<PlayerInfo> {
	const [id, name] = await Promise.all([
		OBR.player.getId(),
		OBR.player.getName(),
	]);
	return { id, name };
}

export function useCharacterSheet(sheetId: string) {
	const [sheet, setSheet] = useState<CharacterT | null>(null);
	const [loading, setLoading] = useState(true);
	const modifierRef = useRef<PlayerInfo | null>(null);

	const debouncedSave = useDebounceCallback(async (data: CharacterT) => {
		try {
			const modifier = modifierRef.current ?? (await getModifier());
			modifierRef.current = modifier;
			await saveSheet(sheetId, data, modifier);
		} catch (err) {
			console.error("Failed to save sheet:", err);
			try {
				const record = await getSheet(sheetId);
				if (record) {
					setSheet(record.sheet);
				}
			} catch (e) {
				console.error("Failed to revert:", e);
			}
		}
	}, 300);

	const loadSheet = useCallback(async () => {
		try {
			const record = await getSheet(sheetId);
			setSheet(record?.sheet || null);
			setLoading(false);
		} catch (err) {
			console.error("Failed to load sheet:", err);
			setLoading(false);
		}
	}, [sheetId]);

	useEffect(() => {
		loadSheet();
	}, [loadSheet]);

	const refresh = useCallback(() => {
		loadSheet();
	}, [loadSheet]);

	const save = useCallback(
		async (data: CharacterT, uploader?: PlayerInfo) => {
			try {
				const modifier = modifierRef.current ?? (await getModifier());
				modifierRef.current = modifier;
				await saveSheet(sheetId, data, modifier, uploader);
			} catch (err) {
				console.error("Failed to save sheet:", err);
				throw err;
			}
		},
		[sheetId],
	);

	const update = useCallback(
		async (data: CharacterT) => {
			setSheet(data);
			debouncedSave(data);
		},
		[debouncedSave],
	);

	const remove = useCallback(async () => {
		try {
			await deleteSheet(sheetId);
		} catch (err) {
			console.error("Failed to delete sheet:", err);
			throw err;
		}
	}, [sheetId]);

	return {
		sheet,
		loading,
		save,
		update,
		remove,
		refresh,
	};
}
