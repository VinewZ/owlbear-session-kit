import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { CharacterT } from "@/hooks/pdf/parser";
import { JsonInput } from "./json-input";
import type { UpdateFieldFn } from "./use-sheet-updater";

type SidebarPanelPropsT = {
  sheet: CharacterT;
  updateField: UpdateFieldFn;
};

type InfoRowPropsT = {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
};

function InfoRow({ label, value, onChange }: InfoRowPropsT) {
  return (
    <Box className="flex items-center justify-between gap-2 px-3 py-1.5">
      <Typography variant="body2" className="text-foreground/60 shrink-0">
        {label}
      </Typography>
      <JsonInput
        className="text-right text-sm"
        value={value}
        onChange={onChange}
      />
    </Box>
  );
}

type SectionPropsT = { title: string; children: React.ReactNode };

function Section({ title, children }: SectionPropsT) {
  return (
    <Box>
      <Typography variant="overline" className="text-foreground/60 block mb-2">
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function SidebarPanel({ sheet, updateField }: SidebarPanelPropsT) {
  const { t } = useTranslation();
  return (
    <Box className="bg-secondary overflow-y-auto flex flex-col gap-5 p-3">
      <Section title={t("character.info")}>
        <Paper variant="outlined" className="dark:bg-background/40">
          <InfoRow
            label={t("character.race")}
            value={sheet.identity.species}
            onChange={(v) => updateField(["identity", "species"], v)}
          />
          <Divider />
          <InfoRow
            label={t("character.class")}
            value={sheet.identity.class}
            onChange={(v) => updateField(["identity", "class"], v)}
          />
          <Divider />
          <InfoRow
            label={t("character.background")}
            value={sheet.identity.background}
            onChange={(v) => updateField(["identity", "background"], v)}
          />
        </Paper>
      </Section>

      <Section title={t("character.spellsCantrips")}>
        <Stack spacing={1}>
          {sheet.spells.map((spell, i) => (
            <Paper
              key={`sidebar-spell-${spell.name ?? i}`}
              variant="outlined"
              className="px-3 py-2 dark:bg-background/40"
            >
              <Box className="flex items-center justify-between">
                <JsonInput
                  className="font-medium text-sm"
                  value={spell.name}
                  onChange={(v) => updateField(["spells", i, "name"], v)}
                />
                <Chip
                  label={Number(spell.level)}
                  size="small"
                  variant="outlined"
                  className="text-xs font-bold uppercase shrink-0"
                />
              </Box>
              <Stack direction="row" spacing={1} className="mt-0.5">
                <Typography variant="caption" className="text-foreground/50">
                  {spell.castingTime}
                </Typography>
                <Typography variant="caption" className="text-foreground/50">
                  {spell.range}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>

        {sheet.spellcasting && (
          <Paper variant="outlined" className="mt-3 dark:bg-background/40">
            <InfoRow
              label={t("combat.ability")}
              value={sheet.spellcasting.ability}
              onChange={(v) => updateField(["spellcasting", "ability"], v)}
            />
            <Divider />
            <InfoRow
              label={t("combat.attackBonus")}
              value={sheet.spellcasting.attackBonus}
              onChange={(v) => updateField(["spellcasting", "attackBonus"], v)}
            />
            <Divider />
            <InfoRow
              label={t("combat.saveDC")}
              value={sheet.spellcasting.saveDC}
              onChange={(v) => updateField(["spellcasting", "saveDC"], v)}
            />
            <Divider />
            <InfoRow
              label={t("combat.mod")}
              value={sheet.spellcasting.mod}
              onChange={(v) => updateField(["spellcasting", "mod"], v)}
            />
          </Paper>
        )}
      </Section>

      <Section title={t("character.equipment")}>
        <Paper variant="outlined" className="p-2 dark:bg-background/40">
          <JsonInput
            className="w-full text-sm"
            value={sheet.equipment}
            onChange={(v) => updateField(["equipment"], v)}
          />
        </Paper>
      </Section>

      <Section title={t("character.languages")}>
        <Paper variant="outlined" className="p-2 dark:bg-background/40">
          <Box className="flex flex-wrap gap-1 mb-2">
            {sheet.identity.languages
              .split(/[,;]+/)
              .map((l) => l.trim())
              .filter(Boolean)
              .map((lang) => (
                <Chip
                  key={lang}
                  label={lang}
                  size="small"
                  variant="outlined"
                  className="text-xs"
                />
              ))}
          </Box>
          <JsonInput
            className="w-full text-xs text-foreground/60"
            value={sheet.identity.languages}
            onChange={(v) => updateField(["identity", "languages"], v)}
          />
        </Paper>
      </Section>

      <Section title={t("character.proficiencies")}>
        <Paper variant="outlined" className="p-2 dark:bg-background/40">
          <JsonInput
            className="w-full text-sm"
            value={sheet.proficiencies}
            onChange={(v) => updateField(["proficiencies"], v)}
          />
        </Paper>
      </Section>

      <Section title={t("character.tools")}>
        <Paper variant="outlined" className="p-2 bg-background/40">
          <JsonInput
            className="w-full text-sm"
            value={sheet.tool}
            onChange={(v) => updateField(["tool"], v)}
          />
        </Paper>
      </Section>
    </Box>
  );
}
