// db-schema.ts
export const STORES = ["SHEETS"];

export type StoreName = (typeof STORES)[number];

export type DBSchemaMap = {
	[K in StoreName]: string;
};
