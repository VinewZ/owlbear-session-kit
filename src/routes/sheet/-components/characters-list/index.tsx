import { Box } from "@mui/material";
import { Upload } from "../upload";
import type * as Y from "yjs";
import type { CharacterT } from "@/hooks/pdf/parser";
import type { SheetMap } from "@/lib/yjs/types";

type CharactersListPropsT = {
  parsePdf: (file: File) => Promise<CharacterT | null>;
  isLoading: boolean;
  sheetId: string;
  sheets?: Y.Map<SheetMap["character"]>;
};

export function CharactersList({
  parsePdf,
  isLoading,
  sheetId,
  sheets,
}: CharactersListPropsT) {
  if (!sheets) {
    return <Box>Loading character sheets...</Box>;
  }

  return (
    <Box>
      {
        <Box className="mb-4">
          <h2 className="text-xl font-bold mb-2">Existing Character Sheets</h2>
          {Array.from(sheets.entries()).map(([id, sheet]) => {
            const character = sheet.get("character");
            if (!character) return null;
            return (
              <Box key={id} className="mb-1 p-2 border rounded">
                <strong>{character.get("identity")?.get("name")}</strong>
                <span className="text-sm text-gray-500 ml-2">({id})</span>
              </Box>
            );
          })}
        </Box>
      }

      <Upload isLoading={isLoading} parsePdf={parsePdf} sheetId={sheetId} />
    </Box>
  );
}
