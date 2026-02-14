import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { CharacterT } from "@/hooks/pdf/parser";
import type { MetadataRecord, SheetRecord } from "./types";

interface SessionKitDB extends DBSchema {
	sheets: {
		key: string;
		value: SheetRecord;
	};
	metadata: {
		key: string;
		value: MetadataRecord;
	};
}

const DB_NAME = "session-kit";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SessionKitDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SessionKitDB>> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await openDB<SessionKitDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Create sheets store
			if (!db.objectStoreNames.contains("sheets")) {
				db.createObjectStore("sheets", { keyPath: "id" });
			}

			// Create metadata store
			if (!db.objectStoreNames.contains("metadata")) {
				db.createObjectStore("metadata", { keyPath: "key" });
			}
		},
	});

	return dbInstance;
}

// Sheet CRUD operations
export async function saveSheet(id: string, data: CharacterT): Promise<void> {
	const db = await getDB();
	const existing = await db.get("sheets", id);

	await db.put("sheets", {
		id,
		data,
		version: existing ? existing.version + 1 : 1,
		lastModified: Date.now(),
		lastSynced: Date.now(),
	});
}

export async function getSheet(id: string): Promise<SheetRecord | undefined> {
	const db = await getDB();
	return db.get("sheets", id);
}

export async function getAllSheets(): Promise<SheetRecord[]> {
	const db = await getDB();
	return db.getAll("sheets");
}

export async function deleteSheet(id: string): Promise<void> {
	const db = await getDB();
	await db.delete("sheets", id);
}

export async function updateSheetVersion(id: string): Promise<void> {
	const db = await getDB();
	const sheet = await db.get("sheets", id);
	if (sheet) {
		sheet.version += 1;
		sheet.lastModified = Date.now();
		await db.put("sheets", sheet);
	}
}

// Metadata operations
export async function setMetadata(key: string, value: unknown): Promise<void> {
	const db = await getDB();
	await db.put("metadata", { key, value });
}

export async function getMetadata(key: string): Promise<unknown> {
	const db = await getDB();
	const record = await db.get("metadata", key);
	return record?.value;
}

export async function deleteMetadata(key: string): Promise<void> {
	const db = await getDB();
	await db.delete("metadata", key);
}
