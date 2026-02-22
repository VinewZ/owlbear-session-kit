import { openDB } from "idb";
import { INDEXEDDB_NAME } from "@/helpers/constants";
import { type DBSchemaMap, STORES, type StoreName } from "./schema";

class ReactiveDB {
	private dbPromise = openDB(INDEXEDDB_NAME, 1, {
		upgrade(db) {
			for (const store of STORES) {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store);
				}
			}
		},
	});

	async get<K extends StoreName>(
		store: K,
		key: IDBValidKey,
	): Promise<DBSchemaMap[K] | undefined> {
		const db = await this.dbPromise;
		return db.get(store, key);
	}

	async set<K extends StoreName>(
		store: K,
		key: IDBValidKey,
		value: DBSchemaMap[K],
	) {
		const db = await this.dbPromise;
		return db.put(store, value, key);
	}
}

export const reactiveDB = new ReactiveDB();
