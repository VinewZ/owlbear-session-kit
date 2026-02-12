import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { DEBUG_WEBRTC } from "@/lib/webrtc/config";
import { useWebRTCMesh } from "@/lib/webrtc/hooks/use-webrtc-mesh";

const FLUSH_INTERVAL = 50; // ms - buffer rapid edits

export function useYDocWebRTC(ydoc: Y.Doc, roomId: string, myPeerId: string) {
	const applyingRemote = useRef(false);
	const bufferRef = useRef<Uint8Array[]>([]);
	const flushTimerRef = useRef<number | null>(null);
	const syncedRef = useRef(false);

	const webrtc = useWebRTCMesh(roomId, myPeerId);

	useEffect(() => {
		const debugLog = (message: string, ...args: unknown[]) => {
			if (DEBUG_WEBRTC) {
				console.log(`[Yjs:${myPeerId.slice(0, 8)}]`, message, ...args);
			}
		};

		debugLog("Initializing Yjs WebRTC sync");

		// Flush buffered updates
		const flush = () => {
			if (bufferRef.current.length === 0) return;

			const merged = Y.mergeUpdates(bufferRef.current);
			bufferRef.current = [];
			flushTimerRef.current = null;

			debugLog(`Sending merged update (${merged.length} bytes)`);

			// Send via WebRTC
			const sent = webrtc.sendToAll(merged);
			debugLog(`Sent to ${sent} peers`);
		};

		// Handle local Yjs updates
		const onLocalUpdate = (update: Uint8Array) => {
			if (applyingRemote.current) return;

			debugLog(`Local update (${update.length} bytes)`);
			bufferRef.current.push(update);

			if (!flushTimerRef.current) {
				flushTimerRef.current = window.setTimeout(flush, FLUSH_INTERVAL);
			}
		};

		ydoc.on("update", onLocalUpdate);

		// Handle incoming WebRTC data
		webrtc.onData((data: Uint8Array, fromPeer: string) => {
			try {
				// Try to parse as sync request first
				const text = new TextDecoder().decode(data);
				const msg = JSON.parse(text);

				if (msg.type === "sync-request" && msg.from !== myPeerId) {
					debugLog(`Received sync request from ${fromPeer.slice(0, 8)}`);

					// Send full state to requesting peer
					const fullState = Y.encodeStateAsUpdate(ydoc);
					debugLog(
						`Sending full state to ${fromPeer.slice(0, 8)} (${fullState.length} bytes)`,
					);

					webrtc.sendToPeer(fromPeer, fullState);
					return;
				}
			} catch {
				// Not a JSON message, treat as Yjs update
			}

			// Apply as Yjs update
			try {
				debugLog(
					`Received update from ${fromPeer.slice(0, 8)} (${data.length} bytes)`,
				);

				applyingRemote.current = true;
				Y.applyUpdate(ydoc, data);
				applyingRemote.current = false;
			} catch (err) {
				console.error("Error applying Yjs update:", err);
				applyingRemote.current = false;
			}
		});

		// Request initial sync when first peer connects
		let syncRequested = false;
		const checkForInitialSync = () => {
			if (!syncRequested && webrtc.isReady && !syncedRef.current) {
				debugLog("Requesting initial sync from peers");
				syncRequested = true;

				// Send a special sync request message
				const syncRequestMsg = new TextEncoder().encode(
					JSON.stringify({ type: "sync-request", from: myPeerId }),
				);
				webrtc.sendToAll(syncRequestMsg);

				// Mark as synced after a delay (assume we got state from peers or none exists)
				setTimeout(() => {
					syncedRef.current = true;
					debugLog("Initial sync completed");
				}, 1000);
			}
		};

		// Check for sync opportunity when peers connect
		const syncInterval = setInterval(checkForInitialSync, 500);

		// Cleanup
		return () => {
			debugLog("Cleaning up Yjs WebRTC sync");
			ydoc.off("update", onLocalUpdate);
			clearInterval(syncInterval);

			if (flushTimerRef.current) {
				clearTimeout(flushTimerRef.current);
				flush(); // Flush any pending updates
			}
		};
	}, [ydoc, myPeerId, webrtc]);
}
