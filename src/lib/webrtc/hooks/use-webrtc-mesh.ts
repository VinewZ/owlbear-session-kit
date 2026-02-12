import { useCallback, useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useChunkedBroadcast } from "@/lib/obr/hooks/use-chunked-broadcast";
import { DEBUG_WEBRTC, WEBRTC_CONFIG } from "../config";
import type { PeerConnection, SignalingMessage, WebRTCMeshAPI } from "../types";
import { useConnectionMetrics } from "./use-connection-metrics";

export function useWebRTCMesh(roomId: string, myPeerId: string): WebRTCMeshAPI {
	const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
	const dataCallbacksRef = useRef<
		Array<(data: Uint8Array, fromPeer: string) => void>
	>([]);

	const { sendMessage, listenMessage } = useChunkedBroadcast();
	const metrics = useConnectionMetrics();

	const signalingChannel = `webrtc-signaling-${roomId}`;

	// Debug logging
	const debugLog = useCallback(
		(message: string, ...args: unknown[]) => {
			if (DEBUG_WEBRTC) {
				console.log(`[WebRTC:${myPeerId.slice(0, 8)}]`, message, ...args);
			}
		},
		[myPeerId],
	);

	// Create peer connection
	const createPeerConnection = useCallback(
		(remotePeerId: string, initiator: boolean) => {
			debugLog(`Creating peer connection to ${remotePeerId.slice(0, 8)}`, {
				initiator,
			});
			metrics.recordConnectionAttempt();

			const peer = new SimplePeer({
				initiator,
				trickle: true,
				config: {
					iceServers: [...WEBRTC_CONFIG.iceServers],
				},
				// For localhost testing, be more lenient
				offerOptions: {
					offerToReceiveAudio: false,
					offerToReceiveVideo: false,
				},
			});

			const peerConn: PeerConnection = {
				peer,
				peerId: remotePeerId,
				state: "connecting",
				bytesReceived: 0,
				bytesSent: 0,
				messagesReceived: 0,
				messagesSent: 0,
			};

			// Handle signaling data
			peer.on("signal", (signal) => {
				debugLog(`Sending signal to ${remotePeerId.slice(0, 8)}`, signal.type);

				const msg: SignalingMessage = {
					type: "webrtc-signal",
					from: myPeerId,
					to: remotePeerId,
					signal,
					roomId,
				};

				sendMessage({
					channel: signalingChannel,
					message: JSON.stringify(msg),
				});
			});

			// Connection established
			peer.on("connect", () => {
				debugLog(`Connected to peer ${remotePeerId.slice(0, 8)}`);
				metrics.recordConnectionSuccess(remotePeerId);
				metrics.updatePeerState(remotePeerId, "connected");

				setPeers((prev) => {
					const updated = new Map(prev);
					const conn = updated.get(remotePeerId);
					if (conn) {
						conn.state = "connected";
						conn.connectedAt = Date.now();
					}
					return updated;
				});
			});

			// Receive data
			peer.on("data", (data: Uint8Array) => {
				peerConn.messagesReceived += 1;
				peerConn.bytesReceived += data.length;
				metrics.recordMessageReceived(data.length);

				// Call all registered callbacks
				for (const callback of dataCallbacksRef.current) {
					callback(data, remotePeerId);
				}
			});

			// Connection closed
			peer.on("close", () => {
				debugLog(`Connection closed with ${remotePeerId.slice(0, 8)}`);
				metrics.updatePeerState(remotePeerId, "disconnected");
				setPeers((prev) => {
					const updated = new Map(prev);
					updated.delete(remotePeerId);
					return updated;
				});
			});

			// Error handling
			peer.on("error", (err) => {
				console.error(
					`WebRTC error with peer ${remotePeerId.slice(0, 8)}:`,
					err,
				);
				metrics.recordConnectionFailure(remotePeerId);
				metrics.updatePeerState(remotePeerId, "failed");

				setPeers((prev) => {
					const updated = new Map(prev);
					const conn = updated.get(remotePeerId);
					if (conn) {
						conn.state = "failed";
					}
					return updated;
				});
			});

			setPeers((prev) => new Map(prev).set(remotePeerId, peerConn));
		},
		[myPeerId, roomId, signalingChannel, sendMessage, debugLog, metrics],
	);

	// Handle incoming WebRTC signals
	const handleWebRTCSignal = useCallback(
		(msg: SignalingMessage & { type: "webrtc-signal" }) => {
			const peerConn = peers.get(msg.from);

			// If we don't have a peer yet, create one (we're the receiver)
			if (!peerConn) {
				createPeerConnection(msg.from, false);
				// Wait a tick for state to update
				setTimeout(() => {
					const conn = peers.get(msg.from);
					if (conn) {
						conn.peer.signal(msg.signal);
					}
				}, 0);
			} else {
				// Apply the signal to existing peer
				try {
					peerConn.peer.signal(msg.signal);
				} catch (err) {
					console.error("Error applying signal:", err);
				}
			}
		},
		[peers, createPeerConnection],
	);

	// Handle signaling messages
	const handleSignalingMessage = useCallback(
		(rawMessage: string) => {
			try {
				const msg = JSON.parse(rawMessage) as SignalingMessage;

				// Ignore messages for other rooms
				if (msg.roomId !== roomId) return;

				switch (msg.type) {
					case "peer-announce":
						if (msg.peerId !== myPeerId && !peers.has(msg.peerId)) {
							debugLog(`Peer announced: ${msg.peerId.slice(0, 8)}`);
							// Lexicographic ordering: only lower ID initiates
							if (myPeerId < msg.peerId) {
								createPeerConnection(msg.peerId, true);
							}
						}
						break;

					case "webrtc-signal":
						if (msg.to === myPeerId) {
							handleWebRTCSignal(msg);
						}
						break;

					case "peer-leave":
						if (msg.peerId !== myPeerId) {
							debugLog(`Peer left: ${msg.peerId.slice(0, 8)}`);
							const peerConn = peers.get(msg.peerId);
							if (peerConn) {
								peerConn.peer.destroy();
								setPeers((prev) => {
									const updated = new Map(prev);
									updated.delete(msg.peerId);
									return updated;
								});
							}
						}
						break;
				}
			} catch (err) {
				console.error("Error handling signaling message:", err);
			}
		},
		[
			roomId,
			myPeerId,
			peers,
			debugLog,
			createPeerConnection,
			handleWebRTCSignal,
		],
	);

	// Setup signaling listener and announce presence
	useEffect(() => {
		debugLog("Initializing WebRTC mesh");

		// Listen for signaling messages
		const unsubscribe = listenMessage({
			channel: signalingChannel,
			onMessage: handleSignalingMessage,
		});

		// Announce presence
		const announceMsg: SignalingMessage = {
			type: "peer-announce",
			peerId: myPeerId,
			roomId,
		};

		sendMessage({
			channel: signalingChannel,
			message: JSON.stringify(announceMsg),
		});

		// Cleanup on unmount
		return () => {
			debugLog("Cleaning up WebRTC mesh");

			// Notify peers we're leaving
			const leaveMsg: SignalingMessage = {
				type: "peer-leave",
				peerId: myPeerId,
				roomId,
			};

			sendMessage({
				channel: signalingChannel,
				message: JSON.stringify(leaveMsg),
			});

			// Destroy all peer connections
			for (const peerConn of peers.values()) {
				peerConn.peer.destroy();
			}

			unsubscribe();
		};
	}, [
		roomId,
		myPeerId,
		signalingChannel,
		sendMessage,
		listenMessage,
		handleSignalingMessage,
		debugLog,
		peers,
	]);

	// Send data to all connected peers
	const sendToAll = useCallback(
		(data: Uint8Array): number => {
			let sent = 0;
			for (const peerConn of peers.values()) {
				if (peerConn.state === "connected") {
					try {
						peerConn.peer.send(data);
						peerConn.messagesSent += 1;
						peerConn.bytesSent += data.length;
						metrics.recordMessageSent(data.length);
						sent += 1;
					} catch (err) {
						console.error("Error sending to peer:", err);
					}
				}
			}
			return sent;
		},
		[peers, metrics],
	);

	// Send data to specific peer
	const sendToPeer = useCallback(
		(peerId: string, data: Uint8Array): boolean => {
			const peerConn = peers.get(peerId);
			if (peerConn && peerConn.state === "connected") {
				try {
					peerConn.peer.send(data);
					peerConn.messagesSent += 1;
					peerConn.bytesSent += data.length;
					metrics.recordMessageSent(data.length);
					return true;
				} catch (err) {
					console.error("Error sending to peer:", err);
					return false;
				}
			}
			return false;
		},
		[peers, metrics],
	);

	// Register callback for incoming data
	const onData = useCallback(
		(callback: (data: Uint8Array, fromPeer: string) => void) => {
			dataCallbacksRef.current.push(callback);
		},
		[],
	);

	return {
		peers: Array.from(peers.values()),
		isReady: Array.from(peers.values()).some((p) => p.state === "connected"),
		connectedCount: Array.from(peers.values()).filter(
			(p) => p.state === "connected",
		).length,
		sendToAll,
		sendToPeer,
		onData,
		metrics: metrics.getMetrics(),
	};
}
