import OBR from "@owlbear-rodeo/sdk";
import {
	type Chunk,
	chunkMessage,
	type OnMessageFn,
	unChunkMessage,
} from "../chunker";

type SendMessagePropsT = {
	channel: string;
	message: string;
};

type ListenMessagePropsT = {
	channel: string;
	onMessage: OnMessageFn;
};

export function useChunkedBroadcast() {
	function sendMessage({ channel, message }: SendMessagePropsT) {
		chunkMessage(message, async (chunk) => {
			await OBR.broadcast.sendMessage(channel, chunk, { destination: "ALL" });
		});
	}

	function listenMessage({ channel, onMessage }: ListenMessagePropsT) {
		const unchunker = unChunkMessage(onMessage);

		const unsubscribe = OBR.broadcast.onMessage(channel, (event) => {
			const received = event.data as Chunk;
			const chunk: Chunk = {
				id: received.id,
				index: received.index,
				total: received.total,
				data: received.data,
			};
			unchunker.addChunk(chunk);
		});

		return () => {
			unsubscribe();
		};
	}

	return {
		sendMessage,
		listenMessage,
	};
}
