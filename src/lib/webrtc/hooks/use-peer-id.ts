import { useMemo } from "react";

/**
 * Generates and persists a stable peer ID across page reloads.
 * Uses sessionStorage so each tab/iframe gets unique ID.
 */
export function usePeerId() {
	return useMemo(() => {
		const stored = sessionStorage.getItem("webrtc-peer-id");
		if (stored) return stored;

		const newId = crypto.randomUUID();
		sessionStorage.setItem("webrtc-peer-id", newId);
		return newId;
	}, []);
}
