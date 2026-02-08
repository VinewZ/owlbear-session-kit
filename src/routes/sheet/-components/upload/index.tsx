import type { CharacterT } from "@/-hooks/pdf/parser";
import { useYDoc } from "@/-hooks/yjs/useYDoc";
import { Y_CHARACTER_SHEETS } from "@/lib/constants";
import { convertToY, getOrCreateSheet } from "@/lib/yjs/index";
import type { SheetsMap } from "@/lib/yjs/types";
import { Box, Button } from "@mui/material";
import { type ChangeEvent, useRef } from "react";
import type * as Y from "yjs";

type UploadPropsT = {
  parsePdf: (file: File) => Promise<CharacterT | null>;
  isLoading: boolean;
  sheetId: string;
};

export function Upload({ parsePdf, isLoading, sheetId }: UploadPropsT) {
  const ydoc = useYDoc(Y_CHARACTER_SHEETS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !ydoc) return;

    const character = await parsePdf(file);
    if (!character) return;

    const sheets = ydoc.getMap<Y.Map<SheetsMap>>("sheets"); 
    const sheet = getOrCreateSheet(sheets, sheetId);

    sheet.set("character", convertToY<CharacterT>(character));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleButtonClick = () => {
    // Prevent opening file dialog if parsing is in progress
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }} // Hide the actual input
        disabled={isLoading}
      />
      <Button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Parsing Sheet..." : "Upload 5e Character Sheet"}
      </Button>
    </Box>
  );
}
