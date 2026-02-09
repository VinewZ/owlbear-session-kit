import * as Y from "yjs";
import { TextAreaBinding } from "y-textarea";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useChunkedBroadcast } from "@/lib/yjs/use-chunked-broadcast";

export const Route = createFileRoute("/sheet/$sheetId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sheetId } = Route.useParams();
	const { sendMessage, listenMessage } = useChunkedBroadcast();
	const txtAreaRef = useRef<HTMLTextAreaElement>(null);

	const ydoc = useMemo(() => new Y.Doc(), []);
	const ytext = useMemo(() => ydoc.getText(sheetId), [ydoc, sheetId]);

	useEffect(() => {
		if (!txtAreaRef.current) return;
		const binding = new TextAreaBinding(ytext, txtAreaRef.current);

		return () => binding.destroy();
	}, [txtAreaRef.current, ytext]);

	useEffect(() => {
		const unsubscribe = listenMessage({
			channel: `yjs-${sheetId}`,
			onMessage: (base64Message) => {
				const update = Uint8Array.from(atob(base64Message), (c) =>
					c.charCodeAt(0),
				);
				Y.applyUpdate(ydoc, update, "remote");
			},
		});

		// Send local updates
		const observer = (update: Uint8Array, origin: any) => {
			if (origin === "remote") return; // avoid echo
			const base64Message = btoa(String.fromCharCode(...update));
			sendMessage({
				channel: `yjs-${sheetId}`,
				message: base64Message,
			});
		};

		ydoc.on("update", observer);

		return () => {
			unsubscribe();
			ydoc.off("update", observer);
			ydoc.destroy();
		};
	}, [sheetId, sendMessage, listenMessage, ydoc]);

	return (
		<textarea
			ref={txtAreaRef}
			className="w-full h-full border p-2"
			placeholder={`Editing sheet: ${sheetId}`}
		/>
	);
}
