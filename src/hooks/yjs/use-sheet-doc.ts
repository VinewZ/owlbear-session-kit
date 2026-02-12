import { useEffect, useRef } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { useChunkedBroadcast } from "@/lib/obr/hooks/use-chunked-broadcast";
import {
	base64ToUint8Array,
	uint8ArrayToBase64,
} from "@/lib/obr/hooks/use-chunked-broadcast/chunker";

type Props = {
	docId: string;
	broadcastChannel: string;
};

export function useSheetDoc({ docId, broadcastChannel }: Props): Y.Doc {
	const { sendMessage, listenMessage } = useChunkedBroadcast();
	const docRef = useRef<Y.Doc | null>(null);

	if (!docRef.current) {
		docRef.current = new Y.Doc();
	}

	const ydoc = docRef.current;

	// Broadcast sync
	useEffect(() => {
		const unsubscribe = listenMessage({
			channel: broadcastChannel,
			onMessage: (base64) => {
				const update = base64ToUint8Array(base64);
				Y.applyUpdate(ydoc, update, "remote");
			},
		});

		const onUpdate = (update: Uint8Array, origin: unknown) => {
			if (origin === "remote") return;

			sendMessage({
				channel: broadcastChannel,
				message: uint8ArrayToBase64(update),
			});
		};

		ydoc.on("update", onUpdate);

		return () => {
			unsubscribe();
			ydoc.off("update", onUpdate);
		};
	}, [ydoc, broadcastChannel, sendMessage, listenMessage]);

	// IndexedDB persistence
	useEffect(() => {
		const persistence = new IndexeddbPersistence(docId, ydoc);

		return () => {
			void persistence.destroy();
		};
	}, [docId, ydoc]);

	// Destroy on unmount
	useEffect(() => {
		return () => {
			ydoc.destroy();
		};
	}, [ydoc]);

	return ydoc;
}
