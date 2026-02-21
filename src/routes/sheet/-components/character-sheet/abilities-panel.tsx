import { Box, Divider, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { JsonInput } from "@/components/json-input";
import type { UpdateFieldFn } from "@/hooks/use-sheet-updater";
import { SKILL_TO_ABILITY } from "@/lib/constants";
import type { CharacterT } from "@/types";
import { lighten } from "@mui/material/styles";

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
      className="flex flex-col gap-1.5 p-1.5 overflow-y-auto"
      sx={{
        bgcolor: (theme) => lighten(theme.palette.background.paper, 0.06),
      }}
    >
      <Typography variant="overline" sx={{ color: "text.secondary", mb: 0.5 }}>
        {t("abilities.abilitiesSkills")}
      </Typography>

      {ABILITIES.map((ability) => {
        const data = sheet.abilities[ability] ?? {};
        const skills = SKILLS_BY_ABILITY[ability] ?? [];
        const hasSkills = skills.some(
          (skill) => sheet.skills[skill] !== undefined,
        );

        return (
          <Paper key={ability} variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  width: 32,
                  shrink: 0,
                  textTransform: "uppercase",
                }}
              >
                {ability}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
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
                    className="text-xl font-bold"
                    value={data.mod}
                    onChange={(v) =>
                      updateField(["abilities", ability, "mod"], v)
                    }
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.disabled", fontSize: "0.625rem" }}
                  >
                    MOD
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
                    SCORE
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
                    SAVE
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
                    if (skillVal === undefined) return null;

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
  );
}
