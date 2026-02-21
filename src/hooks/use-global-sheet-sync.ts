import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef } from "react";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { useChunkedBroadcast } from "@/lib/obr/hooks/use-chunked-broadcast";
import { getAllSheets, getSheet, saveSheet } from "@/lib/storage/indexeddb";
import type { BroadcastMessage } from "@/types";

const lastUpdateTimestamps = new Map<string, number>();

export function useGlobalSheetSync() {
	const hasReceivedFullSync = useRef(false);
	const playerIdRef = useRef<string | null>(null);
	const { sendMessage, listenMessage } = useChunkedBroadcast();

	useEffect(() => {
		if (!OBR.isAvailable) return;

		let unsubscribe: (() => void) | null = null;

		async function handleUpdate(
			message: Extract<BroadcastMessage, { type: "update" }>,
		) {
			const lastTimestamp = lastUpdateTimestamps.get(message.sheetId) ?? 0;
			if (message.timestamp <= lastTimestamp) return;

			await saveSheet(message.sheetId, message.data);
			lastUpdateTimestamps.set(message.sheetId, message.timestamp);
		}

		async function handleRequestSync(
			message: Extract<BroadcastMessage, { type: "request-sync" }>,
		) {
			if (!playerIdRef.current) return;

			const record = await getSheet(message.sheetId);
			if (!record?.data) return;

			const syncMessage: BroadcastMessage = {
				type: "update",
				sheetId: message.sheetId,
				data: record.data,
				senderId: playerIdRef.current,
				timestamp: Date.now(),
			};

			sendMessage({
				channel: MAIN_BROADCAST_CHANNEL,
				message: JSON.stringify(syncMessage),
			});
		}

		async function handleFullSyncRequest(
			message: Extract<BroadcastMessage, { type: "full-sync-request" }>,
		) {
			if (!playerIdRef.current) return;
			if (playerIdRef.current === message.senderId) return;

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

			sendMessage({
				channel: MAIN_BROADCAST_CHANNEL,
				message: JSON.stringify(syncMessage),
			});
		}

		async function handleFullSyncResponse(
			message: Extract<BroadcastMessage, { type: "full-sync-response" }>,
		) {
			if (hasReceivedFullSync.current) return;
			hasReceivedFullSync.current = true;

			for (const sheet of message.sheets) {
				const existing = await getSheet(sheet.id);
				if (!existing || existing.lastModified < sheet.lastModified) {
					await saveSheet(sheet.id, sheet.data);
					lastUpdateTimestamps.set(sheet.id, sheet.lastModified);
				}
			}
		}

		async function broadcastFullSyncRequest() {
			const message: BroadcastMessage = {
				type: "full-sync-request",
				senderId: playerIdRef.current ?? undefined,
			};

			sendMessage({
				channel: MAIN_BROADCAST_CHANNEL,
				message: JSON.stringify(message),
			});

			setTimeout(() => {
				hasReceivedFullSync.current = true;
			}, 2000);
		}

		OBR.onReady(async () => {
			const playerId = await OBR.player.getId();
			playerIdRef.current = playerId;

			unsubscribe = listenMessage({
				channel: MAIN_BROADCAST_CHANNEL,
				onMessage: async (data) => {
					try {
						const message: BroadcastMessage = JSON.parse(data);

						if (message.senderId === playerIdRef.current) return;

						if (message.type === "update") {
							await handleUpdate(message);
						} else if (message.type === "request-sync") {
							await handleRequestSync(message);
						} else if (message.type === "full-sync-request") {
							await handleFullSyncRequest(message);
						} else if (message.type === "full-sync-response") {
							await handleFullSyncResponse(message);
						}
					} catch (err) {
						console.error("Failed to handle global sync broadcast:", err);
					}
				},
			});

			await broadcastFullSyncRequest();
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [sendMessage, listenMessage]);
}
