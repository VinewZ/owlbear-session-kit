import type { RealtimePostgresChangesPayload } from "@supabase/realtime-js";
import supabase from "@/lib/supabase";
import type { CharacterT } from "@/types";

export interface SheetRecord {
	id: string;
	data: CharacterT;
	last_modified: number;
}

// CRUD Operations
export async function getSheet(id: string): Promise<SheetRecord | null> {
	const { data, error } = await supabase
		.from("sheets")
		.select("*")
		.eq("id", id)
		.single();

	if (error) {
		if (error.code === "PGRST116") return null; // Not found
		throw error;
	}

	return data;
}

export async function saveSheet(
	id: string,
	data: CharacterT,
	last_modified?: number,
): Promise<void> {
	const timestamp = last_modified ?? Date.now();
	const { error } = await supabase.from("sheets").upsert(
		{
			id,
			data,
			last_modified: timestamp,
		},
		{ onConflict: "id" },
	);

	if (error) throw error;
}

export async function deleteSheet(id: string): Promise<void> {
	const { error } = await supabase.from("sheets").delete().eq("id", id);

	if (error) throw error;
}

export async function getAllSheets(): Promise<SheetRecord[]> {
	const { data, error } = await supabase
		.from("sheets")
		.select("*")
		.order("last_modified", { ascending: false });

	if (error) throw error;
	return data || [];
}

// Realtime subscription helper
export function subscribeToSheet(
	sheetId: string,
	callback: (payload: {
		eventType: string;
		new: SheetRecord | null;
		old: SheetRecord | null;
	}) => void,
) {
	const channel = supabase.channel(`sheet-${sheetId}`);
	channel.on(
		"postgres_changes",
		{
			event: "*",
			schema: "public",
			table: "sheets",
			filter: `id=eq.${sheetId}`,
		},
		(payload: RealtimePostgresChangesPayload<SheetRecord>) => {
			// Map Supabase payload to simplified shape
			if (payload.eventType === "DELETE") {
				callback({
					eventType: payload.eventType,
					new: null,
					old: payload.old as SheetRecord,
				});
			} else {
				// INSERT or UPDATE: new is guaranteed to be SheetRecord
				callback({
					eventType: payload.eventType,
					new: payload.new,
					old:
						payload.eventType === "INSERT"
							? null
							: (payload.old as SheetRecord | null),
				});
			}
		},
	);
	return channel.subscribe();
}

// Subscribe to all sheets (for list views)
export function subscribeToAllSheets(
	callback: (payload: {
		eventType: string;
		new: SheetRecord | null;
		old: SheetRecord | null;
	}) => void,
) {
	const channel = supabase.channel("all-sheets");
	channel.on(
		"postgres_changes",
		{
			event: "*",
			schema: "public",
			table: "sheets",
		},
		(payload: RealtimePostgresChangesPayload<SheetRecord>) => {
			if (payload.eventType === "DELETE") {
				callback({
					eventType: payload.eventType,
					new: null,
					old: payload.old as SheetRecord,
				});
			} else {
				callback({
					eventType: payload.eventType,
					new: payload.new,
					old:
						payload.eventType === "INSERT"
							? null
							: (payload.old as SheetRecord | null),
				});
			}
		},
	);
	return channel.subscribe();
}
