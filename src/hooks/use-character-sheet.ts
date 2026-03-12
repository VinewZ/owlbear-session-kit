import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import {
	deleteSheet,
	getSheet,
	saveSheet,
	subscribeToSheet,
} from "@/lib/storage/supabase";
import type { CharacterT } from "@/types";

export function useCharacterSheet(sheetId: string) {
	const [sheet, setSheet] = useState<CharacterT | null>(null);
	const [loading, setLoading] = useState(true);

	// Track timestamps to avoid duplicate/stale updates
	const lastSentRef = useRef<number>(0);
	const currentLastModifiedRef = useRef<number>(0);

	// Debounced save (300ms) - batches rapid changes
	const debouncedSave = useDebounceCallback(
		async (data: CharacterT) => {
			try {
				const timestamp = Date.now();
				lastSentRef.current = timestamp;
				await saveSheet(sheetId, data, timestamp);
				// Update our last modified marker after successful save
				currentLastModifiedRef.current = timestamp;
			} catch (err) {
				console.error("Failed to save sheet:", err);
				// Revert to server state on error
				try {
					const record = await getSheet(sheetId);
					if (record) {
						setSheet(record.data);
						currentLastModifiedRef.current = record.last_modified;
					}
				} catch (e) {
					console.error("Failed to revert:", e);
				}
			}
		},
		300, // 300ms debounce - balances responsiveness vs network load
	);

	// Load initial data
	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const record = await getSheet(sheetId);
				if (mounted) {
					setSheet(record?.data || null);
					if (record?.last_modified) {
						currentLastModifiedRef.current = record.last_modified;
					}
					setLoading(false);
				}
			} catch (err) {
				console.error("Failed to load sheet:", err);
				if (mounted) {
					setLoading(false);
				}
			}
		}

		load();

		return () => {
			mounted = false;
		};
	}, [sheetId]);

	// Subscribe to realtime updates
	useEffect(() => {
		const subscription = subscribeToSheet(sheetId, (payload) => {
			if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
				if (!payload.new) return;

				const incomingLm = payload.new.last_modified;

				// Skip if this is our own update (timestamp matches)
				// or if this update is older than what we already have
				if (incomingLm <= currentLastModifiedRef.current) {
					return;
				}

				// Apply the newer update
				currentLastModifiedRef.current = incomingLm;
				setSheet(payload.new.data);
			} else if (payload.eventType === "DELETE") {
				setSheet(null);
				currentLastModifiedRef.current = 0;
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [sheetId]);

	const save = useCallback(
		async (data: CharacterT) => {
			try {
				const timestamp = Date.now();
				lastSentRef.current = timestamp;
				await saveSheet(sheetId, data, timestamp);
				currentLastModifiedRef.current = timestamp;
			} catch (err) {
				console.error("Failed to save sheet:", err);
				throw err;
			}
		},
		[sheetId],
	);

	const update = useCallback(
		async (data: CharacterT) => {
			// Optimistic update for immediate UI feedback
			setSheet(data);
			// Debounce the actual save
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
	};
}
