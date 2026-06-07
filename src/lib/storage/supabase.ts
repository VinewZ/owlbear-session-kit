import supabase from "@/lib/supabase";
import type { CharacterT, LastModified, PlayerInfo } from "@/types";

export interface SheetRecord {
	id: string;
	name: string;
	class: string;
	level: number;
	sheet: CharacterT;
	last_modified: LastModified;
	uploader: PlayerInfo | null;
}

export async function getSheet(id: string): Promise<SheetRecord | null> {
	const { data, error } = await supabase
		.from("sheets")
		.select("*")
		.eq("id", id)
		.single();

	if (error) {
		if (error.code === "PGRST116") return null;
		throw error;
	}

	return data;
}

export async function saveSheet(
	id: string,
	sheet: CharacterT,
	modifier: PlayerInfo,
	uploader?: PlayerInfo,
): Promise<void> {
	const { error } = await supabase.from("sheets").upsert(
		{
			id,
			name: sheet.identity.name,
			class: sheet.identity.class,
			level: sheet.identity.level,
			sheet,
			last_modified: {
				id: modifier.id,
				name: modifier.name,
				timestamp: Date.now(),
			},
			...(uploader ? { uploader } : {}),
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

export type SheetListItem = Pick<
	SheetRecord,
	"id" | "name" | "class" | "level" | "last_modified"
>;

export async function getSheetList(): Promise<SheetListItem[]> {
	const { data, error } = await supabase
		.from("sheets")
		.select("id, name, class, level, last_modified")
		.order("last_modified", { ascending: false });

	if (error) throw error;
	return data || [];
}
