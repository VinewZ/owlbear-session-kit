export function formatMod(mod: number | undefined): string {
	if (mod === undefined) return "—";
	return mod >= 0 ? `+${mod}` : `${mod}`;
}
