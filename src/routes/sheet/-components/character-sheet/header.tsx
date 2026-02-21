import { Box, Skeleton, Typography } from "@mui/material";
import { JsonInput } from "@/components/json-input";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import { useToken } from "@/lib/obr/hooks/use-token";
import type { CharacterT } from "@/types";
import { useAccentColor } from "@/hooks/use-accent-color";
import { darken } from "@mui/material/styles";

type HeaderProps = {
  sheet: CharacterT;
  sheetId: string;
  updateField: UpdateFieldFn;
};

export function Header({ sheet, sheetId, updateField }: HeaderProps) {
  const { token, loading: tokenLoading } = useToken(sheetId);
  const { accentColor } = useAccentColor();

  return (
    <Box
      className="bg-paper text-foreground flex items-center justify-between px-4 py-3 gap-4 border-b-2"
      sx={{
        bgcolor: (theme) => darken(theme.palette.background.paper, 0.06),
        borderColor: accentColor,
      }}
    >
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
            className="shrink-0 rounded-full overflow-hidden p-1"
            sx={{
              width: 70,
              height: 70,
              bgcolor: () => darken(accentColor, 0.6),
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
          <JsonInput
            className="text-2xl font-bold leading-tight"
            value={sheet.identity.name}
            onChange={(v) => updateField(["identity", "name"], v)}
          />
          <Box className="flex items-baseline gap-1 flex-wrap leading-snug ml-1">
            <Typography variant="caption" className="text-foreground/60">
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
            <Typography variant="caption" className="text-foreground/60">
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
        <Typography variant="overline" className="text-foreground/50 block">
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
