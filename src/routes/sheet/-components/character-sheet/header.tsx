import { Box, Skeleton, Typography } from "@mui/material";

import type { CharacterT } from "@/hooks/pdf/parser";
import { useToken } from "@/lib/obr/hooks/use-token";
import { JsonInput } from "./json-input";
import type { UpdateFieldFn } from "./use-sheet-updater";

type HeaderPropsT = {
	sheet: CharacterT;
	sheetId: string;
	updateField: UpdateFieldFn;
};

export function Header({ sheet, sheetId, updateField }: HeaderPropsT) {
	const { token, loading: tokenLoading } = useToken(sheetId);

	return (
		<Box className="bg-primary text-primary-foreground flex items-center justify-between px-4 py-3 gap-4">
			<Box className="flex items-center gap-3 min-w-0">
				{tokenLoading ? (
					<Skeleton
						variant="circular"
						width={56}
						height={56}
						className="shrink-0"
					/>
				) : (
					<Box
						className="shrink-0 rounded-full overflow-hidden border-2 border-primary-foreground/30"
						style={{ width: 56, height: 56 }}
					>
						{token?.image?.url ? (
							<img
								src={token.image.url}
								alt="Portrait"
								className="h-full object-cover mx-auto"
							/>
						) : (
							<Box className="w-full h-full bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
								{sheet.identity.name?.[0] ?? "?"}
							</Box>
						)}
					</Box>
				)}

				<Box className="min-w-0">
					<JsonInput
						className="text-2xl font-bold leading-tight"
						value={sheet.identity.name}
						onChange={(v) => updateField(["identity", "name"], v)}
					/>
					<Box className="flex items-baseline gap-1 flex-wrap leading-snug">
						<Typography
							variant="caption"
							className="text-primary-foreground/70"
						>
							Level
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.level}
							onChange={(v) => updateField(["identity", "level"], v)}
						/>
						<JsonInput
							className="text-sm"
							value={sheet.identity.species}
							onChange={(v) => updateField(["identity", "species"], v)}
						/>
						<JsonInput
							className="text-sm"
							value={sheet.identity.class}
							onChange={(v) => updateField(["identity", "class"], v)}
						/>
						<Typography
							variant="caption"
							className="text-primary-foreground/70"
						>
							•
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.background}
							onChange={(v) => updateField(["identity", "background"], v)}
						/>
					</Box>
				</Box>
			</Box>

			<Box className="shrink-0 text-right">
				<Typography
					variant="overline"
					className="text-primary-foreground/60 block"
				>
					Experience
				</Typography>
				<JsonInput
					className="text-lg font-semibold text-right"
					value={sheet.identity.experience}
					onChange={(v) => updateField(["identity", "experience"], v)}
				/>
			</Box>
		</Box>
	);
}
