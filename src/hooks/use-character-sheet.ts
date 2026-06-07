import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import OBR from "@owlbear-rodeo/sdk";
import {
	attachToken,
	deleteSheet,
	detachToken,
	getSheetByToken,
	saveSheet,
} from "@/lib/storage/supabase";
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
	const sheetUuidRef = useRef<string | null>(null);

	const debouncedSave = useDebounceCallback(async (data: CharacterT) => {
		try {
			const modifier = modifierRef.current ?? (await getModifier());
			modifierRef.current = modifier;
			await saveSheet(data, modifier);
		} catch (err) {
			console.error("Failed to save sheet:", err);
			try {
				const record = await getSheetByToken(sheetId);
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
			const record = await getSheetByToken(sheetId);
			if (record) {
				sheetUuidRef.current = record.id;
				setSheet(record.sheet);
			} else {
				sheetUuidRef.current = null;
				setSheet(null);
			}
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
				const uuid = await saveSheet(data, modifier, uploader);
				sheetUuidRef.current = uuid;
				await attachToken(sheetId, uuid);
				setSheet(data);
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
			await detachToken(sheetId);
			sheetUuidRef.current = null;
			setSheet(null);
		} catch (err) {
			console.error("Failed to unlink sheet:", err);
			throw err;
		}
	}, [sheetId]);

	const deletePermanently = useCallback(async () => {
		try {
			const uuid = sheetUuidRef.current;
			if (!uuid) return;
			await deleteSheet(uuid);
			sheetUuidRef.current = null;
			setSheet(null);
		} catch (err) {
			console.error("Failed to delete sheet:", err);
			throw err;
		}
	}, []);

	const attachSheet = useCallback(
		async (sheetUuid: string) => {
			try {
				await attachToken(sheetId, sheetUuid);
				await loadSheet();
			} catch (err) {
				console.error("Failed to attach sheet:", err);
				throw err;
			}
		},
		[sheetId, loadSheet],
	);

	return {
		sheet,
		loading,
		save,
		update,
		remove,
		refresh,
		attachSheet,
		deletePermanently,
	};
}
