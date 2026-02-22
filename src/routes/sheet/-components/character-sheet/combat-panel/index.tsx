import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { JsonInput } from "@/components/json-input";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import type { CharacterT } from "@/types";
import { HitPointsCard } from "./hit-points-card";
import { SpellsTable } from "./spells-table";
import { WeaponsTable } from "./weapons-table";

type CombatPanelProps = {
	sheet: CharacterT;
	updateField: UpdateFieldFn;
};

const COMBAT_STATS = [
	{ labelKey: "combat.armorClass", field: "armorClass", primary: true },
	{ labelKey: "combat.initiative", field: "initiative", primary: false },
	{ labelKey: "combat.speed", field: "speed", primary: false },
] as const;

export function CombatPanel({ sheet, updateField }: CombatPanelProps) {
	const [combatTab, setCombatTab] = useState<"weapons" | "spells">("weapons");
	const { t } = useTranslation();

	const currentHP = sheet.combat.currentHP ?? 0;
	const maxHP = sheet.combat.maxHP ?? 1;
	const hpPercent = Math.min(100, Math.max(0, (currentHP / maxHP) * 100));

	return (
		<Box className="flex flex-col gap-6 px-4 py-4 overflow-y-auto">
			<Box className="grid grid-cols-3 gap-3">
				{COMBAT_STATS.map(({ labelKey, field, primary }) => (
					<Paper
						key={field}
						variant="outlined"
						className={`p-4 flex flex-col items-center gap-1 ${
							primary ? "border-2 border-primary" : ""
						}`}
					>
						<Typography
							variant="overline"
							className="text-foreground/60 leading-none text-center"
						>
							{t(labelKey)}
						</Typography>
						<JsonInput
							className="text-4xl font-bold text-center"
							value={sheet.combat[field]}
							onChange={(v) => updateField(["combat", field], v)}
						/>
					</Paper>
				))}
			</Box>

			<Box className="grid grid-cols-2 gap-3">
				<Paper
					variant="outlined"
					className="p-4 flex flex-col items-center justify-center"
				>
					<Typography
						variant="overline"
						className="text-foreground/60 text-center leading-tight"
					>
						{t("combat.proficiency")}
					</Typography>
					<JsonInput
						className="text-4xl font-bold text-center"
						value={sheet.combat.proficiencyBonus}
						onChange={(v) => updateField(["combat", "proficiencyBonus"], v)}
					/>
				</Paper>
				<Paper
					variant="outlined"
					className="p-4 flex flex-col items-center justify-center"
				>
					<Typography
						variant="overline"
						className="text-foreground/60 text-center leading-tight"
					>
						{t("combat.passivePerception")}
					</Typography>
					<JsonInput
						className="text-4xl font-bold text-center"
						value={sheet.identity.passivePerception}
						onChange={(v) => updateField(["identity", "passivePerception"], v)}
					/>
				</Paper>
			</Box>

			<HitPointsCard
				sheet={sheet}
				hpPercent={hpPercent}
				updateField={updateField}
			/>

			<Box>
				<Typography variant="overline" className="block mb-1">
					{t("combat.attacksSpellcasting")}
				</Typography>
				<Tabs
					value={combatTab}
					onChange={(_, v) => setCombatTab(v)}
					className="mb-2"
				>
					<Tab value="weapons" label={t("combat.weapons")} />
					<Tab value="spells" label={t("combat.spellsCantrips")} />
				</Tabs>

				{combatTab === "weapons" && (
					<WeaponsTable sheet={sheet} updateField={updateField} />
				)}
				{combatTab === "spells" && (
					<SpellsTable sheet={sheet} updateField={updateField} />
				)}
			</Box>

			<Box>
				<Typography variant="overline" className="block mb-1">
					{t("combat.classFeatures")}
				</Typography>
				<Paper variant="outlined" className="p-3">
					<JsonInput
						className="w-full min-h-32"
						value={sheet.classFeatures}
						onChange={(v) => updateField(["classFeatures"], v)}
					/>
				</Paper>
			</Box>
		</Box>
	);
}
