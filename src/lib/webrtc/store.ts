import { create } from "zustand";

interface ConnectionState {
	status: "disconnected" | "connecting" | "connected" | "failed";
	connectedPeers: number;
	lastError: string | null;
	warnings: string[];

	setStatus: (status: ConnectionState["status"]) => void;
	setConnectedPeers: (count: number) => void;
	addWarning: (warning: string) => void;
	setError: (error: string | null) => void;
	clearWarnings: () => void;
}

export const useConnectionState = create<ConnectionState>((set) => ({
	status: "disconnected",
	connectedPeers: 0,
	lastError: null,
	warnings: [],

	setStatus: (status) => set({ status }),
	setConnectedPeers: (count) => set({ connectedPeers: count }),
	addWarning: (warning) =>
		set((state) => ({
			warnings: [...state.warnings, warning],
		})),
	setError: (error) => set({ lastError: error }),
	clearWarnings: () => set({ warnings: [] }),
}));
