import OBR from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import type { CharacterT } from "@/hooks/pdf/parser";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { getSheet, saveSheet } from "@/lib/storage/indexeddb";

interface BroadcastMessage {
	type: "update" | "request-sync";
	sheetId: string;
	data?: CharacterT;
	senderId?: string;
	timestamp?: number;
}

/**
 * Simple hook to manage a character sheet with broadcast sync
 * Loads from IndexedDB on mount, syncs with other users via OBR broadcast
 */
export function useCharacterSheet(sheetId: string) {
	const [sheet, setSheet] = useState<CharacterT | null>(null);
	const [loading, setLoading] = useState(true);
	const isApplyingRemote = useRef(false);
	const lastUpdateTimestamp = useRef(0);

	// Load sheet from IndexedDB on mount
	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const record = await getSheet(sheetId);
				if (mounted) {
					setSheet(record?.data || null);
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

	// Save sheet to IndexedDB
	const save = useCallback(
		async (data: CharacterT) => {
			try {
				await saveSheet(sheetId, data);
				setSheet(data);
			} catch (err) {
				console.error("Failed to save sheet:", err);
				throw err;
			}
		},
		[sheetId],
	);

	// Broadcast update to other users (debounced)
	const broadcastUpdate = useDebounceCallback(async (data: CharacterT) => {
		if (isApplyingRemote.current) return;

		const playerId = await OBR.player.getId();
		const timestamp = Date.now();
		lastUpdateTimestamp.current = timestamp;

		const message: BroadcastMessage = {
			type: "update",
			sheetId,
			data,
			senderId: playerId,
			timestamp,
		};

		await OBR.broadcast.sendMessage(
			MAIN_BROADCAST_CHANNEL,
			JSON.stringify(message),
			{ destination: "ALL" },
		);
	}, 300);

	// Update sheet (local state + save to IndexedDB + broadcast)
	const update = useCallback(
		async (data: CharacterT) => {
			if (isApplyingRemote.current) return;

			setSheet(data); // Optimistic update
			try {
				await saveSheet(sheetId, data);
				broadcastUpdate(data); // Broadcast to other users
			} catch (err) {
				console.error("Failed to save sheet:", err);
			}
		},
		[sheetId, broadcastUpdate],
	);

	// Listen for broadcasts from other users
	useEffect(() => {
		const unsubscribe = OBR.broadcast.onMessage(
			MAIN_BROADCAST_CHANNEL,
			async (event) => {
				try {
					const message: BroadcastMessage = JSON.parse(event.data as string);

					// Ignore messages for other sheets
					if (message.sheetId !== sheetId) return;

					const playerId = await OBR.player.getId();

					// Ignore our own messages
					if (message.senderId === playerId) return;

					if (message.type === "update" && message.data) {
						// Ignore old updates (already applied)
						if (
							message.timestamp &&
							message.timestamp <= lastUpdateTimestamp.current
						) {
							return;
						}

						// Apply update from another user
						isApplyingRemote.current = true;
						setSheet(message.data);
						await saveSheet(sheetId, message.data);
						if (message.timestamp) {
							lastUpdateTimestamp.current = message.timestamp;
						}
						isApplyingRemote.current = false;
					} else if (message.type === "request-sync") {
						// Another user is requesting the current state
						if (sheet) {
							const syncMessage: BroadcastMessage = {
								type: "update",
								sheetId,
								data: sheet,
								senderId: playerId,
								timestamp: Date.now(),
							};
							await OBR.broadcast.sendMessage(
								MAIN_BROADCAST_CHANNEL,
								JSON.stringify(syncMessage),
								{ destination: "ALL" },
							);
						}
					}
				} catch (err) {
					console.error("Failed to handle broadcast:", err);
				}
			},
		);

		return () => {
			unsubscribe();
		};
	}, [sheetId, sheet]);

	// Request sync from other users if no local data
	useEffect(() => {
		if (!loading && !sheet) {
			const requestSync = async () => {
				const playerId = await OBR.player.getId();
				const message: BroadcastMessage = {
					type: "request-sync",
					sheetId,
					senderId: playerId,
				};

				await OBR.broadcast.sendMessage(
					MAIN_BROADCAST_CHANNEL,
					JSON.stringify(message),
					{ destination: "ALL" },
				);
			};

			requestSync();
		}
	}, [loading, sheet, sheetId]);

	return {
		sheet,
		loading,
		save,
		update,
	};
}
