import type { CharacterT } from "./character";

export interface SheetRecord {
	id: string;
	data: CharacterT;
	version: number;
	lastModified: number;
	lastSynced: number;
}

export interface MetadataRecord {
	key: string;
	value: unknown;
}
