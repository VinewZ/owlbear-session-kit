import { Box, LinearProgress, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { JsonInput } from "@/components/json-input";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import type { CharacterT } from "@/types";

type HitPointsCardProps = {
	sheet: CharacterT;
	hpPercent: number;
	updateField: UpdateFieldFn;
};

export function HitPointsCard({
	sheet,
	hpPercent,
	updateField,
}: HitPointsCardProps) {
	const { t } = useTranslation();
	return (
		<Paper variant="outlined" className="p-4">
			<Typography variant="overline" className="text-foreground/60 block mb-2">
				{t("combat.hitPoints")}
			</Typography>
			<Box className="flex items-end gap-3 mb-3">
				<Box className="flex flex-col items-center">
					<JsonInput
						className="text-3xl font-bold text-center w-16"
						value={sheet.combat.currentHP}
						onChange={(v) => updateField(["combat", "currentHP"], v)}
					/>
					<Typography variant="caption" className="text-foreground/50">
						{t("combat.current")}
					</Typography>
				</Box>
				<Typography variant="h5" className="text-foreground/40 mb-1">
					/
				</Typography>
				<Box className="flex flex-col items-center">
					<JsonInput
						className="text-3xl font-bold text-center w-16"
						value={sheet.combat.maxHP}
						onChange={(v) => updateField(["combat", "maxHP"], v)}
					/>
					<Typography variant="caption" className="text-foreground/50">
						{t("combat.max")}
					</Typography>
				</Box>
				<Box className="flex flex-col items-center ml-2">
					<JsonInput
						className="text-xl text-center w-12"
						value={sheet.combat.tempHP}
						onChange={(v) => updateField(["combat", "tempHP"], v)}
					/>
					<Typography variant="caption" className="text-foreground/50">
						{t("combat.temp")}
					</Typography>
				</Box>
			</Box>
			<LinearProgress
				variant="determinate"
				value={hpPercent}
				color="success"
				className="rounded-full"
			/>
		</Paper>
	);
}
