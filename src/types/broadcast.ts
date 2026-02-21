import type { CharacterT } from "./character";

export type BroadcastMessage =
	| {
			type: "update";
			sheetId: string;
			data: CharacterT;
			senderId: string;
			timestamp: number;
	  }
	| {
			type: "delete";
			sheetId: string;
			senderId: string;
	  }
	| {
			type: "request-sync";
			sheetId: string;
			senderId: string;
	  }
	| {
			type: "full-sync-request";
			senderId?: string;
	  }
	| {
			type: "full-sync-response";
			senderId?: string;
			sheets: Array<{
				id: string;
				data: CharacterT;
				lastModified: number;
			}>;
	  };

export type SheetSyncData = {
	id: string;
	data: CharacterT;
	lastModified: number;
};
