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

export interface TokenSheet {
	token_id: string;
	sheet_id: string;
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

export async function getSheetByToken(
	tokenId: string,
): Promise<SheetRecord | null> {
	const { data, error } = await supabase
		.from("token_sheets")
		.select("sheet_id, sheets(*)")
		.eq("token_id", tokenId)
		.single();

	if (error) {
		if (error.code === "PGRST116") return null;
		throw error;
	}

	const sheet = data?.sheets as unknown as SheetRecord | null;
	return sheet ?? null;
}

export async function saveSheet(
	sheet: CharacterT,
	modifier: PlayerInfo,
	uploader?: PlayerInfo,
): Promise<string> {
	const { data, error } = await supabase
		.from("sheets")
		.upsert(
			{
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
			{
				onConflict: "name,class",
			},
		)
		.select("id")
		.single();

	if (error) throw error;
	return data.id;
}

export async function attachToken(
	tokenId: string,
	sheetId: string,
): Promise<void> {
	const { error } = await supabase
		.from("token_sheets")
		.upsert(
			{ token_id: tokenId, sheet_id: sheetId },
			{ onConflict: "token_id" },
		);

	if (error) throw error;
}

export async function detachToken(tokenId: string): Promise<void> {
	const { error } = await supabase
		.from("token_sheets")
		.delete()
		.eq("token_id", tokenId);

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
