import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef } from "react";
import type { CharacterT } from "@/hooks/pdf/parser";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { getAllSheets, getSheet, saveSheet } from "@/lib/storage/indexeddb";

interface BroadcastMessage {
	type: "update" | "request-sync" | "full-sync-request" | "full-sync-response";
	sheetId?: string;
	data?: CharacterT;
	senderId?: string;
	timestamp?: number;
	sheets?: Array<{ id: string; data: CharacterT; lastModified: number }>;
}

const lastUpdateTimestamps = new Map<string, number>();

export function useGlobalSheetSync() {
	const hasReceivedFullSync = useRef(false);
	const playerIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (!OBR.isAvailable) return;

		let unsubscribe: (() => void) | null = null;

		OBR.onReady(async () => {
			const playerId = await OBR.player.getId();
			playerIdRef.current = playerId;

			unsubscribe = OBR.broadcast.onMessage(
				MAIN_BROADCAST_CHANNEL,
				async (event) => {
					try {
						const message: BroadcastMessage = JSON.parse(event.data as string);

						if (message.senderId === playerIdRef.current) return;

						if (message.type === "update" && message.sheetId && message.data) {
							const lastTimestamp =
								lastUpdateTimestamps.get(message.sheetId) ?? 0;
							if (message.timestamp && message.timestamp <= lastTimestamp) {
								return;
							}

							await saveSheet(message.sheetId, message.data);
							if (message.timestamp) {
								lastUpdateTimestamps.set(message.sheetId, message.timestamp);
							}
						} else if (message.type === "request-sync" && message.sheetId) {
							const record = await getSheet(message.sheetId);
							if (record?.data && playerIdRef.current) {
								const syncMessage: BroadcastMessage = {
									type: "update",
									sheetId: message.sheetId,
									data: record.data,
									senderId: playerIdRef.current,
									timestamp: Date.now(),
								};
								await OBR.broadcast.sendMessage(
									MAIN_BROADCAST_CHANNEL,
									JSON.stringify(syncMessage),
									{ destination: "ALL" },
								);
							}
						} else if (message.type === "full-sync-request") {
							if (
								hasReceivedFullSync.current ||
								!playerIdRef.current ||
								playerIdRef.current === message.senderId
							)
								return;

							const sheets = await getAllSheets();
							if (sheets.length === 0) return;

							const syncMessage: BroadcastMessage = {
								type: "full-sync-response",
								senderId: playerIdRef.current,
								sheets: sheets.map((s) => ({
									id: s.id,
									data: s.data,
									lastModified: s.lastModified,
								})),
							};

							await OBR.broadcast.sendMessage(
								MAIN_BROADCAST_CHANNEL,
								JSON.stringify(syncMessage),
								{ destination: "ALL" },
							);
						} else if (
							message.type === "full-sync-response" &&
							message.sheets &&
							!hasReceivedFullSync.current
						) {
							hasReceivedFullSync.current = true;

							for (const sheet of message.sheets) {
								const existing = await getSheet(sheet.id);
								if (!existing || existing.lastModified < sheet.lastModified) {
									await saveSheet(sheet.id, sheet.data);
									lastUpdateTimestamps.set(sheet.id, sheet.lastModified);
								}
							}
						}
					} catch (err) {
						console.error("Failed to handle global sync broadcast:", err);
					}
				},
			);

			const message: BroadcastMessage = {
				type: "full-sync-request",
				senderId: playerIdRef.current ?? undefined,
			};

			await OBR.broadcast.sendMessage(
				MAIN_BROADCAST_CHANNEL,
				JSON.stringify(message),
				{ destination: "ALL" },
			);

			setTimeout(() => {
				hasReceivedFullSync.current = true;
			}, 2000);
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);
}
