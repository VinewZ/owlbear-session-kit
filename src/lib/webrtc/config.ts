// Check if running on localhost
const isLocalhost =
	window.location.hostname === "localhost" ||
	window.location.hostname === "127.0.0.1" ||
	window.location.hostname === "[::1]";

export const WEBRTC_CONFIG = {
	// ICE servers (public STUN - free!)
	// For localhost, we don't need STUN servers
	iceServers: isLocalhost
		? []
		: [
				{ urls: "stun:stun.l.google.com:19302" },
				{ urls: "stun:stun1.l.google.com:19302" },
				{ urls: "stun:stun.cloudflare.com:3478" },
			],

	// Connection settings
	connectionTimeout: 30000, // 30s to establish connection
	heartbeatInterval: 30000, // 30s ping
	reconnectAttempts: 3,
	reconnectDelay: 2000, // 2s between attempts

	// Data channel settings
	dataChannel: {
		ordered: true, // Maintain message order
		maxRetransmits: 3,
	},
} as const;

export const DEBUG_WEBRTC = import.meta.env.VITE_DEBUG_WEBRTC === "true";
