import OBR from "@owlbear-rodeo/sdk";
import {
	type Chunk,
	chunkMessage,
	type OnMessageFn,
	unChunkMessage,
} from "./chunker";

type SendMessagePropsT = {
	channel: string;
	message: string;
};

type ListenMessagePropsT = {
	channel: string;
	onMessage: OnMessageFn;
};

export const chunkedBroadcast = {
	sendMessage({ channel, message }: SendMessagePropsT) {
		chunkMessage(message, async (chunk) => {
			await OBR.broadcast.sendMessage(channel, chunk, {
				destination: "ALL",
			});
		});
	},

	listenMessage({ channel, onMessage }: ListenMessagePropsT) {
		const unchunker = unChunkMessage(onMessage);

		const unsubscribe = OBR.broadcast.onMessage(channel, (event) => {
			const received = event.data as Chunk;

			unchunker.addChunk({
				id: received.id,
				index: received.index,
				total: received.total,
				data: received.data,
			});
		});

		return unsubscribe;
	},
};
