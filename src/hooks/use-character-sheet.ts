import OBR from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { useChunkedBroadcast } from "@/lib/obr/hooks/use-chunked-broadcast";
import { getSheet, saveSheet } from "@/lib/storage/indexeddb";
import type { BroadcastMessage, CharacterT } from "@/types";

export function useCharacterSheet(sheetId: string) {
	const [sheet, setSheet] = useState<CharacterT | null>(null);
	const [loading, setLoading] = useState(true);
	const isApplyingRemote = useRef(false);
	const lastUpdateTimestamp = useRef(0);
	const { sendMessage, listenMessage } = useChunkedBroadcast();

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

		sendMessage({
			channel: MAIN_BROADCAST_CHANNEL,
			message: JSON.stringify(message),
		});
	}, 300);

	const save = useCallback(
		async (data: CharacterT) => {
			try {
				await saveSheet(sheetId, data);
				setSheet(data);
				broadcastUpdate(data);
			} catch (err) {
				console.error("Failed to save sheet:", err);
				throw err;
			}
		},
		[sheetId, broadcastUpdate],
	);

	const update = useCallback(
		async (data: CharacterT) => {
			if (isApplyingRemote.current) return;

			setSheet(data);
			try {
				await saveSheet(sheetId, data);
				broadcastUpdate(data);
			} catch (err) {
				console.error("Failed to save sheet:", err);
			}
		},
		[sheetId, broadcastUpdate],
	);

	useEffect(() => {
		if (!OBR.isAvailable) return;

		const unsubscribe = listenMessage({
			channel: MAIN_BROADCAST_CHANNEL,
			onMessage: async (data) => {
				try {
					const message: BroadcastMessage = JSON.parse(data);

					if (message.type !== "update") return;
					if (message.sheetId !== sheetId) return;

					const playerId = await OBR.player.getId();
					if (message.senderId === playerId) return;

					if (message.timestamp <= lastUpdateTimestamp.current) return;

					isApplyingRemote.current = true;
					setSheet(message.data);
					lastUpdateTimestamp.current = message.timestamp;
					isApplyingRemote.current = false;
				} catch (err) {
					console.error("Failed to handle broadcast:", err);
				}
			},
		});

		return () => {
			unsubscribe();
		};
	}, [sheetId, listenMessage]);

	return {
		sheet,
		loading,
		save,
		update,
	};
}
