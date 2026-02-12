import type SimplePeer from "simple-peer";

export type PeerConnectionState =
	| "connecting"
	| "connected"
	| "disconnected"
	| "failed";

export interface PeerConnection {
	peer: SimplePeer.Instance;
	peerId: string;
	state: PeerConnectionState;
	connectedAt?: number;
	bytesReceived: number;
	bytesSent: number;
	messagesReceived: number;
	messagesSent: number;
}

export type SignalingMessage =
	| { type: "peer-announce"; peerId: string; roomId: string }
	| { type: "peer-leave"; peerId: string; roomId: string }
	| {
			type: "webrtc-signal";
			from: string;
			to: string;
			signal: SimplePeer.SignalData;
			roomId: string;
	  };

export interface WebRTCMeshAPI {
	peers: PeerConnection[];
	isReady: boolean;
	connectedCount: number;
	sendToAll: (data: Uint8Array) => number;
	sendToPeer: (peerId: string, data: Uint8Array) => boolean;
	onData: (callback: (data: Uint8Array, fromPeer: string) => void) => void;
	metrics: ConnectionMetrics;
}

export interface ConnectionMetrics {
	totalBytesSent: number;
	totalBytesReceived: number;
	totalMessagesSent: number;
	totalMessagesReceived: number;
	connectionAttempts: number;
	successfulConnections: number;
	failedConnections: number;
	averageLatency: number;
	peerStates: Record<string, PeerConnectionState>;
}
