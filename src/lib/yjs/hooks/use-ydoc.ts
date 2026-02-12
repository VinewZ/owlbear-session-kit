import { useRef } from "react";
import * as Y from "yjs";
// WebRTC is disabled for localhost testing - see LOCALHOST_TESTING.md
// import { usePeerId } from "@/lib/webrtc/hooks/use-peer-id";
// import { useYDocWebRTC } from "./use-ydoc-webrtc";
import { useYDocBroadcast } from "./use-ydoc-broadcast";
import { useYDocPersistence } from "./use-ydoc-persistance";

const DOC_NAME = "global-ydoc"; // must be stable

export function useYDoc() {
	const ref = useRef<Y.Doc | null>(null);
	// const peerId = usePeerId();

	if (!ref.current) {
		ref.current = new Y.Doc();
	}

	useYDocPersistence(ref.current, DOC_NAME);

	// Use OBR.broadcast for localhost testing
	// Switch to useYDocWebRTC when deploying to production
	useYDocBroadcast(ref.current);
	// useYDocWebRTC(ref.current, DOC_NAME, peerId);

	return ref.current;
}
