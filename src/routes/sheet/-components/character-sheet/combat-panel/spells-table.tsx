import AddIcon from "@mui/icons-material/Add";
import {
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { JsonInput } from "@/components/json-input";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import type { CharacterT } from "@/types";

type SpellsTableProps = {
	sheet: CharacterT;
	updateField: UpdateFieldFn;
};

export function SpellsTable({ sheet, updateField }: SpellsTableProps) {
	const { t } = useTranslation();
	return (
		<>
			<TableContainer component={Paper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow className="bg-secondary">
							<TableCell>{t("combat.lvl")}</TableCell>
							<TableCell>{t("combat.name")}</TableCell>
							<TableCell>{t("combat.castTime")}</TableCell>
							<TableCell>{t("combat.range")}</TableCell>
							<TableCell className="min-w-64">{t("combat.notes")}</TableCell>
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
										onChange={(v) =>
											updateField(["spells", i, "castingTime"], v)
										}
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
			<Button
				variant="outlined"
				startIcon={<AddIcon />}
				onClick={() => {
					const newIndex = sheet.spells.length;
					updateField(["spells", newIndex], {
						name: "",
						level: 1,
						range: "",
						castingTime: "",
						notes: "",
					});
				}}
				fullWidth
				sx={{ mt: 2 }}
			>
				{t("combat.addSpell")}
			</Button>
		</>
	);
}
