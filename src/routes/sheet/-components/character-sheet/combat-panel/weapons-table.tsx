import {
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

type WeaponsTableProps = {
	sheet: CharacterT;
	updateField: UpdateFieldFn;
};

export function WeaponsTable({ sheet, updateField }: WeaponsTableProps) {
	const { t } = useTranslation();
	return (
		<TableContainer component={Paper} variant="outlined">
			<Table size="small">
				<TableHead>
					<TableRow className="bg-secondary">
						<TableCell>{t("combat.weapon")}</TableCell>
						<TableCell>{t("combat.bonus")}</TableCell>
						<TableCell>{t("combat.damage")}</TableCell>
						<TableCell className="min-w-64">{t("combat.notes")}</TableCell>
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
