import { Box, Paper, Skeleton, Typography, useMediaQuery } from "@mui/material";
import { darken, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { JsonInput } from "@/components/json-input";
import { useAccentColor } from "@/hooks/use-accent-color";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import { useToken } from "@/lib/obr/hooks/use-token";
import type { CharacterT } from "@/types";

type HeaderProps = {
	sheet: CharacterT;
	sheetId: string;
	updateField: UpdateFieldFn;
};

export function Header({ sheet, sheetId, updateField }: HeaderProps) {
	const { token, loading: tokenLoading } = useToken(sheetId);
	const { accentColor } = useAccentColor();

	const { t } = useTranslation();
	const theme = useTheme();
	const isWide = useMediaQuery(theme.breakpoints.up("md"));

	return (
		<Box
			className="bg-paper text-foreground flex items-center justify-between px-4 py-3 gap-4 border-b"
			sx={{
				flexDirection: isWide ? "flex-row" : "flex-col",
				bgcolor: (theme) => darken(theme.palette.background.paper, 0.06),
				borderColor: accentColor,
			}}
		>
			<Box
				className="flex items-center gap-3 min-w-0"
				sx={{
					flexDirection: isWide ? "flex-row" : "flex-col",
				}}
			>
				{tokenLoading ? (
					<Skeleton
						variant="circular"
						width={56}
						height={56}
						className="shrink-0"
					/>
				) : (
					<Box
						className="shrink-0 rounded-full overflow-hidden p-1"
						sx={{
							width: 70,
							height: 70,
							bgcolor: (theme) =>
								darken(accentColor || theme.palette.background.default, 0.6),
						}}
					>
						{token?.image?.url ? (
							<img
								src={token.image.url}
								alt="Portrait"
								className="h-full object-cover mx-auto"
							/>
						) : (
							<Box className="w-full h-full bg-foreground/10 rounded-full flex items-center justify-center text-lg font-bold">
								{sheet.identity.name?.[0] ?? "?"}
							</Box>
						)}
					</Box>
				)}

				<Box className="min-w-0">
					<Box className="flex gap-1 items-center">
						<JsonInput
							className="ml-1 text-2xl font-bold leading-tight"
							value={sheet.identity.name}
							onChange={(v) => updateField(["identity", "name"], v)}
						/>

						<Typography className="text-foreground/60 mr-1">-</Typography>
						<Typography className="text-foreground/60">
							{t("character.level")}
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.level}
							onChange={(v) => updateField(["identity", "level"], v)}
						/>
						<Typography className="text-foreground/60 mr-1">-</Typography>
						<Typography className="text-foreground/60">
							{t("character.level")}
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.experience}
							onChange={(v) => updateField(["identity", "experience"], v)}
						/>
					</Box>
					<Box className="flex items-baseline gap-1 flex-wrap leading-snug ml-1">
						<JsonInput
							className="text-sm"
							value={sheet.identity.species}
							onChange={(v) => updateField(["identity", "species"], v)}
						/>
						<Typography variant="caption" className="text-foreground/60">
							•
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.background}
							onChange={(v) => updateField(["identity", "background"], v)}
						/>
						<Typography variant="caption" className="text-foreground/60">
							•
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.class}
							onChange={(v) => updateField(["identity", "class"], v)}
						/>
						<Typography variant="caption" className="text-foreground/60">
							•
						</Typography>
						<JsonInput
							className="text-sm"
							value={sheet.identity.subclass}
							onChange={(v) => updateField(["identity", "subclass"], v)}
						/>
					</Box>
				</Box>
			</Box>

			<Box>
				<Paper variant="outlined" className="p-2 bg-card">
					<Box className="flex items-center justify-between gap-2">
						<Box className="flex flex-col">
							<Typography variant="caption" className="text-foreground/60">
								{t("character.cp")}
							</Typography>
							<JsonInput
								className="text-center"
								value={sheet.currency?.cp ?? 0}
								onChange={(v) => updateField(["currency", "cp"], v)}
							/>
						</Box>
						<Box className="flex flex-col">
							<Typography variant="caption" className="text-foreground/60">
								{t("character.sp")}
							</Typography>
							<JsonInput
								className="text-center"
								value={sheet.currency?.sp ?? 0}
								onChange={(v) => updateField(["currency", "sp"], v)}
							/>
						</Box>
						<Box className="flex flex-col">
							<Typography variant="caption" className="text-foreground/60">
								{t("character.ep")}
							</Typography>
							<JsonInput
								className="text-center"
								value={sheet.currency?.ep ?? 0}
								onChange={(v) => updateField(["currency", "ep"], v)}
							/>
						</Box>
						<Box className="flex flex-col">
							<Typography variant="caption" className="text-foreground/60">
								{t("character.gp")}
							</Typography>
							<JsonInput
								className="text-center"
								value={sheet.currency?.gp ?? 0}
								onChange={(v) => updateField(["currency", "gp"], v)}
							/>
						</Box>
						<Box className="flex flex-col">
							<Typography variant="caption" className="text-foreground/60">
								{t("character.pp")}
							</Typography>
							<JsonInput
								className="text-center"
								value={sheet.currency?.pp ?? 0}
								onChange={(v) => updateField(["currency", "pp"], v)}
							/>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Box>
	);
}
