export const CHUNK_SIZE = 14000; // bytes, adjust to SDK limit

export type Chunk = {
	id: string;
	index: number;
	total: number;
	data: string;
};

export type SendChunkFn = (chunk: Chunk) => void;
export type OnMessageFn = (message: string) => void;

export function uint8ArrayToBase64(bytes: Uint8Array): string {
	let binary = "";
	const chunkSize = 0x8000; // 32 KB slices
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const slice = bytes.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...slice);
	}
	return window.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
	const binary = window.atob(base64);
	const len = binary.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export function chunkMessage(
	message: string,
	sendChunk: SendChunkFn,
	chunkSize: number = CHUNK_SIZE,
) {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(message);
	const totalChunks = Math.ceil(bytes.length / chunkSize);
	const id = crypto.randomUUID();

	for (let i = 0; i < totalChunks; i++) {
		const start = i * chunkSize;
		const end = Math.min(bytes.length, start + chunkSize);
		const chunkData = bytes.slice(start, end);

		const sendableChunk: Chunk = {
			id,
			index: i,
			total: totalChunks,
			data: uint8ArrayToBase64(chunkData),
		};

		sendChunk(sendableChunk);
	}
}

export function unChunkMessage(onMessage?: OnMessageFn) {
	const buffer: Record<string, Map<number, Uint8Array>> = {};
	const totalChunksMap: Record<string, number> = {};

	function addChunk(chunk: Chunk) {
		const { id, index, total, data } = chunk;

		const bytes = base64ToUint8Array(data);

		if (!buffer[id]) buffer[id] = new Map();
		if (!totalChunksMap[id]) totalChunksMap[id] = total;

		buffer[id].set(index, bytes);

		if (buffer[id].size === totalChunksMap[id]) {
			const fullBytes = new Uint8Array(
				[...buffer[id].values()].flatMap((b) => Array.from(b)),
			);

			const message = new TextDecoder().decode(fullBytes);

			// Clean up
			delete buffer[id];
			delete totalChunksMap[id];

			onMessage?.(message);
		}
	}

	return { addChunk };
}
