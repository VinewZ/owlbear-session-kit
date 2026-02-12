import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { useChunkedBroadcast } from "@/lib/obr/hooks/use-chunked-broadcast";
import type { YjsMessage } from "../types";

export function useYDocBroadcast(ydoc: Y.Doc) {
	const applyingRemote = useRef(false);

	const bufferRef = useRef<Uint8Array[]>([]);
	const flushTimerRef = useRef<number | null>(null);
	const FLUSH_INTERVAL = 50; // ms (tune 30–100)

	const { sendMessage, listenMessage } = useChunkedBroadcast();

	useEffect(() => {
		/* ---- send incremental updates ---- */
		const flush = () => {
			if (bufferRef.current.length === 0) return;

			const merged = Y.mergeUpdates(bufferRef.current);
			bufferRef.current = [];
			flushTimerRef.current = null;

			const msg = {
				type: "update",
				update: Array.from(merged),
			};

			sendMessage({
				channel: MAIN_BROADCAST_CHANNEL,
				message: JSON.stringify(msg),
			});
		};

		const onLocalUpdate = (update: Uint8Array) => {
			if (applyingRemote.current) return;

			bufferRef.current.push(update);

			if (!flushTimerRef.current) {
				flushTimerRef.current = window.setTimeout(flush, FLUSH_INTERVAL);
			}
		};

		ydoc.on("update", onLocalUpdate);

		/* ---- receive messages ---- */
		const unsubscribe = listenMessage({
			channel: MAIN_BROADCAST_CHANNEL,
			onMessage: (raw) => {
				const parsedMsg = JSON.parse(raw);
				const msg = parsedMsg as YjsMessage;
				switch (msg.type) {
					case "sync-request": {
						const full = Y.encodeStateAsUpdate(ydoc);

						sendMessage({
							channel: MAIN_BROADCAST_CHANNEL,
							message: JSON.stringify({
								type: "sync-response",
								update: Array.from(full),
							}),
						});

						break;
					}

					case "sync-response": {
						applyingRemote.current = true;
						Y.applyUpdate(ydoc, new Uint8Array(msg.update));
						applyingRemote.current = false;

						break;
					}

					case "update": {
						applyingRemote.current = true;
						Y.applyUpdate(ydoc, new Uint8Array(msg.update));
						applyingRemote.current = false;
						break;
					}
				}
			},
		});

		/* ---- request initial sync ---- */
		sendMessage({
			channel: MAIN_BROADCAST_CHANNEL,
			message: JSON.stringify({ type: "sync-request" }),
		});

		return () => {
			ydoc.off("update", onLocalUpdate);
			unsubscribe();
		};
	}, [ydoc, sendMessage, listenMessage]);
}
