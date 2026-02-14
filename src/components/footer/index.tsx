import { CloseFullscreen, OpenInFull } from "@mui/icons-material";
import { Button, Grid, MenuItem, Select } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SHEET_POPVER_ID, DEFAULT_SHEET_POPOVER_SIZE } from "@/lib/constants";

export function Footer() {
  const [isMinimized, setIsMinimized] = useState(false);
  const { t, i18n } = useTranslation();

  async function closeSheet() {
    await OBR.popover.close(SHEET_POPVER_ID);
  }
  async function handleSizeSheet() {
    if (isMinimized) {
      await Promise.all([
        OBR.popover.setHeight(
          SHEET_POPVER_ID,
          DEFAULT_SHEET_POPOVER_SIZE.height,
        ),
        OBR.popover.setWidth(SHEET_POPVER_ID, DEFAULT_SHEET_POPOVER_SIZE.width),
      ]);
      setIsMinimized((prev) => !prev);
    } else {
      await Promise.all([
        OBR.popover.setHeight(SHEET_POPVER_ID, 45),
        OBR.popover.setWidth(SHEET_POPVER_ID, 250),
      ]);
      setIsMinimized((prev) => !prev);
    }
  }

  return (
    <Grid
      container
      className="h-12 items-center justify-between fixed bottom-0 left-0 right-0 border-t-2 border-primary bg-card px-4"
    >
      <Button
        onClick={handleSizeSheet}
        className="rounded-lg px-4 py-2 transition hover:opacity-90"
      >
        {isMinimized ? (
          <OpenInFull color="action" />
        ) : (
          <CloseFullscreen color="action" />
        )}
      </Button>
      {!isMinimized && (
        <Select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="bg-card border border-border rounded px-2 py-1 text-sm"
          size="small"
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
        </Select>
      )}
      <Button
        onClick={closeSheet}
        className="bg-primary text-primary-foreground rounded-lg px-4 py-2 mr-4 transition hover:opacity-90"
      >
        {t("footer.close")}
      </Button>
    </Grid>
  );
}
