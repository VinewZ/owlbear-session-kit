import { Box, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CharacterT } from "@/hooks/pdf/parser";
import { SKILL_TO_ABILITY } from "@/lib/constants";
import { JsonInput } from "./json-input";
import type { UpdateFieldFn } from "./use-sheet-updater";

type AbilitiesPanelPropsT = {
	sheet: CharacterT;
	updateField: UpdateFieldFn;
};

const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

const SKILLS_BY_ABILITY = Object.entries(SKILL_TO_ABILITY).reduce<
	Record<string, string[]>
>((acc, [skill, ability]) => {
	if (!acc[ability]) acc[ability] = [];
	acc[ability].push(skill);
	return acc;
}, {});

export function AbilitiesPanel({ sheet, updateField }: AbilitiesPanelPropsT) {
	const { t } = useTranslation();
	return (
		<Box className="bg-secondary overflow-y-auto flex flex-col gap-4 p-3">
			<Box>
				<Typography
					variant="overline"
					className="text-foreground/60 block mb-2"
				>
					{t("abilities.scores")}
				</Typography>
				<Box className="flex flex-col gap-2">
					{ABILITIES.map((ability) => {
						const data = sheet.abilities[ability] ?? {};
						return (
							<Paper
								key={ability}
								variant="outlined"
								className="px-3 py-2 flex items-center justify-between gap-2 dark:bg-background/40"
							>
								<Typography
									variant="caption"
									className="font-bold uppercase text-foreground/60 w-8 shrink-0"
								>
									{t(`abilities.${ability.toLowerCase()}`)}
								</Typography>
								<Box className="flex flex-col items-center flex-1">
									<JsonInput
										className="text-2xl font-bold text-center"
										value={data.mod}
										onChange={(v) =>
											updateField(["abilities", ability, "mod"], v)
										}
									/>
									<JsonInput
										className="text-xs text-center text-foreground/60"
										value={data.score}
										onChange={(v) =>
											updateField(["abilities", ability, "score"], v)
										}
									/>
								</Box>
								<Box className="text-right shrink-0 w-10">
									<Typography
										variant="caption"
										className="text-foreground/40 block"
									>
										{t("abilities.save")}
									</Typography>
									<JsonInput
										className="text-xs text-center"
										value={data.save !== undefined ? data.save : "—"}
										onChange={(v) =>
											updateField(["abilities", ability, "save"], v)
										}
									/>
								</Box>
							</Paper>
						);
					})}
				</Box>
			</Box>

			<Box>
				<Typography
					variant="overline"
					className="text-foreground/60 block mb-2"
				>
					{t("abilities.skills")}
				</Typography>
				<Box className="flex flex-col gap-0.5">
					{ABILITIES.map((ability) =>
						(SKILLS_BY_ABILITY[ability] ?? []).map((skill) => {
							const skillVal = sheet.skills[skill];
							if (skillVal === undefined) return null;
							return (
								<Box
									key={skill}
									className="flex items-center justify-between px-2 py-0.5 rounded hover:bg-background/50 transition-colors"
								>
									<Typography variant="caption" className="capitalize">
										{t(`skills.${skill.toLowerCase().replace(/ /g, "_")}`, {
											defaultValue: skill.toLowerCase(),
										})}
									</Typography>
									<JsonInput
										className="text-xs text-right w-10"
										value={skillVal}
										onChange={(v) => updateField(["skills", skill], v)}
									/>
								</Box>
							);
						}),
					)}
				</Box>
			</Box>
		</Box>
	);
}
