import { Box, Divider, Paper, Typography } from "@mui/material";
import { lighten } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { JsonInput } from "@/components/json-input";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import { SKILL_TO_ABILITY } from "@/lib/constants";
import type { CharacterT } from "@/types";

type AbilitiesPanelProps = {
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

export function AbilitiesPanel({ sheet, updateField }: AbilitiesPanelProps) {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: 1.5,
				p: 1.5,
				overflowY: "auto",
				bgcolor: (theme) => lighten(theme.palette.background.paper, 0.06),
			}}
		>
			<Typography variant="overline" sx={{ color: "text.secondary" }}>
				{t("abilities.abilitiesSkills")}
			</Typography>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
					gap: 1,
				}}
			>
				{ABILITIES.map((ability) => {
					const data = sheet.abilities[ability] ?? {};
					const skills = SKILLS_BY_ABILITY[ability] ?? [];
					const hasSkills = skills.some(
						(skill) => sheet.skills[skill] !== undefined,
					);

					return (
						<Paper key={ability} variant="outlined" sx={{ overflow: "hidden" }}>
								<Typography
									sx={{
										fontWeight: "bold",
										textTransform: "uppercase",
                    fontSize: 24,
                    textAlign: "center",
                    marginTop: 1,
									}}
								>
									{t(`abilities.${ability.toLowerCase()}`)}
								</Typography>

							<Box
								sx={{
									position: "relative",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									px: 2,
									py: 1,
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										flex: 1,
										justifyContent: "center",
									}}
								>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											minWidth: 40,
										}}
									>
										<JsonInput
											className="font-bold"
											value={data.mod}
											onChange={(v) =>
												updateField(["abilities", ability, "mod"], v)
											}
										/>
										<Typography
											variant="caption"
											sx={{ color: "text.disabled", fontSize: "0.625rem" }}
										>
											{t("abilities.mod")}
										</Typography>
									</Box>

									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											minWidth: 40,
										}}
									>
										<JsonInput
											className="text-base font-medium"
											value={data.score}
											onChange={(v) =>
												updateField(["abilities", ability, "score"], v)
											}
										/>
										<Typography
											variant="caption"
											sx={{ color: "text.disabled", fontSize: "0.625rem" }}
										>
											{t("abilities.score")}
										</Typography>
									</Box>

									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											minWidth: 40,
										}}
									>
										<JsonInput
											className="text-base font-medium"
											value={data.save !== undefined ? data.save : "—"}
											onChange={(v) =>
												updateField(["abilities", ability, "save"], v)
											}
										/>
										<Typography
											variant="caption"
											sx={{ color: "text.disabled", fontSize: "0.625rem" }}
										>
											{t("abilities.save")}
										</Typography>
									</Box>
								</Box>
							</Box>

							{hasSkills && (
								<>
									<Divider />
									<Box sx={{ px: 2, py: 0.5 }}>
										{skills.map((skill) => {
											const skillVal = sheet.skills[skill];

											return (
												<Box
													key={skill}
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
														py: 0.25,
														"&:hover": { bgcolor: "action.hover" },
														borderRadius: 0.5,
														px: 0.5,
													}}
												>
													<Typography
														variant="caption"
														sx={{ textTransform: "capitalize" }}
													>
														{t(
															`skills.${skill.toLowerCase().replace(/ /g, "_")}`,
															{
																defaultValue: skill.toLowerCase(),
															},
														)}
													</Typography>
													<JsonInput
														className="text-xs text-right w-8"
														value={skillVal}
														onChange={(v) => updateField(["skills", skill], v)}
													/>
												</Box>
											);
										})}
									</Box>
								</>
							)}
						</Paper>
					);
				})}
			</Box>
		</Box>
	);
}
