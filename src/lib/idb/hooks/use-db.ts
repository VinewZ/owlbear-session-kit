import { useEffect, useState } from "react";
import { SYNC_UPDATE_CHANNEL } from "@/helpers/constants";
import { chunkedBroadcast } from "@/lib/obr/use-chunked-broadcast";
import { reactiveDB } from "./reactiveDB";
import type { DBSchemaMap, StoreName } from "./schema";

export function useDB<K extends StoreName>(
	store: K,
	key: string,
	initialValue: DBSchemaMap[K],
) {
	const [value, setValue] = useState<DBSchemaMap[K]>(initialValue);
	const { sendMessage } = chunkedBroadcast;

	useEffect(() => {
		let mounted = true;

		reactiveDB.get(store, key).then((v) => {
			if (mounted && v !== undefined) setValue(v);
		});

		return () => {
			mounted = false;
		};
	}, [store, key]);

	const update = async (newValue: DBSchemaMap[K]) => {
		setValue(newValue);
		sendMessage({
			channel: SYNC_UPDATE_CHANNEL,
			message: `${store}-${key}-${JSON.stringify(newValue)}`,
		});
		await reactiveDB.set(store, key, newValue);
	};

	return [value, update];
}
