import {
	Box,
	LinearProgress,
	Paper,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CharacterT } from "@/hooks/pdf/parser";
import { cn } from "@/lib/utils";
import { JsonInput } from "./json-input";
import type { UpdateFieldFn } from "./use-sheet-updater";

type CombatPanelPropsT = {
	sheet: CharacterT;
	updateField: UpdateFieldFn;
};

const COMBAT_STATS = [
	{ labelKey: "combat.armorClass", field: "armorClass", primary: true },
	{ labelKey: "combat.initiative", field: "initiative", primary: false },
	{ labelKey: "combat.speed", field: "speed", primary: false },
] as const;

export function CombatPanel({ sheet, updateField }: CombatPanelPropsT) {
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
						className={cn(
							"p-4 flex flex-col items-center gap-1",
							primary && "border-2 border-primary",
						)}
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

			<Box className="grid grid-cols-[1fr_auto] gap-3">
				<HitPointsCard
					sheet={sheet}
					hpPercent={hpPercent}
					updateField={updateField}
				/>
				<Paper
					variant="outlined"
					className="p-4 flex flex-col items-center justify-center min-w-24"
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
			</Box>

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

// ── Sub-components ────────────────────────────────────────────────────────────

type SubPropsT = { sheet: CharacterT; updateField: UpdateFieldFn };
type HitPointsPropsT = SubPropsT & { hpPercent: number };

function HitPointsCard({ sheet, hpPercent, updateField }: HitPointsPropsT) {
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

function WeaponsTable({ sheet, updateField }: SubPropsT) {
	const { t } = useTranslation();
	return (
		<TableContainer component={Paper} variant="outlined">
			<Table size="small">
				<TableHead>
					<TableRow className="bg-secondary">
						<TableCell>{t("combat.weapon")}</TableCell>
						<TableCell>{t("combat.bonus")}</TableCell>
						<TableCell>{t("combat.damage")}</TableCell>
						<TableCell>{t("combat.notes")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{sheet.weapons.map((weapon, i) => (
						<TableRow
							key={`weapon-${weapon.name ?? i}`}
							className="hover:bg-secondary/50 transition-colors"
						>
							<TableCell>
								<JsonInput
									value={weapon.name}
									onChange={(v) => updateField(["weapons", i, "name"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={weapon.bonus}
									onChange={(v) => updateField(["weapons", i, "bonus"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={weapon.damage}
									onChange={(v) => updateField(["weapons", i, "damage"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={weapon.notes}
									onChange={(v) => updateField(["weapons", i, "notes"], v)}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

function SpellsTable({ sheet, updateField }: SubPropsT) {
	const { t } = useTranslation();
	return (
		<TableContainer component={Paper} variant="outlined">
			<Table size="small">
				<TableHead>
					<TableRow className="bg-secondary">
						<TableCell>{t("combat.lvl")}</TableCell>
						<TableCell>{t("combat.name")}</TableCell>
						<TableCell>{t("combat.castTime")}</TableCell>
						<TableCell>{t("combat.range")}</TableCell>
						<TableCell>{t("combat.notes")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{sheet.spells.map((spell, i) => (
						<TableRow
							key={`spell-${spell.name ?? i}`}
							className="hover:bg-secondary/50 transition-colors"
						>
							<TableCell>
								<JsonInput
									value={spell.level}
									onChange={(v) => updateField(["spells", i, "level"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={spell.name}
									onChange={(v) => updateField(["spells", i, "name"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={spell.castingTime}
									onChange={(v) => updateField(["spells", i, "castingTime"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={spell.range}
									onChange={(v) => updateField(["spells", i, "range"], v)}
								/>
							</TableCell>
							<TableCell>
								<JsonInput
									value={spell.notes}
									onChange={(v) => updateField(["spells", i, "notes"], v)}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
