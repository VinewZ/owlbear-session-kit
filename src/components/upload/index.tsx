import { Button } from "@mui/material";
import { Loader2, Upload as UploadIcon } from "lucide-react";
import { useRef } from "react";
import type { Doc } from "yjs";
import { applyJSONToYDoc } from "@/helpers/apply-json-to-ydoc";
import { useToken } from "@/hooks/obr/use-token";
import { use5eSheetParser } from "@/hooks/pdf/use-5e-sheet-parser";
import { logger } from "@/lib/utils";
import { jsonToY } from "@/lib/yjs/helpers/json-to-y";
import type * as Y from "yjs";
import type { YMap } from "node_modules/yjs/dist/src/internals";
import type { CharacterT } from "@/hooks/pdf/parser";

interface UploadProps {
  sheetsMap: YMap<CharacterT>;
  sheetId: string;
}

export function Upload({ sheetId, sheetsMap, setCharacter }: UploadProps) {
  const { isLoading, parsePdf } = use5eSheetParser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useToken(sheetId);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    try {
      const character = await parsePdf(file);
      if (!character) return logger.error("Parsed PDF is empty");
      const charMap = jsonToY(character);
      sheetsMap.set(sheetId, charMap);
      setCharacter(charMap)
    } catch (err) {
      logger.error("Unable to parse PDF:", err);
      alert("Failed to parse PDF. Please try again.");
    }
  };

  return (
    <div className="inline-block">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        variant="contained"
        startIcon={isLoading ? <Loader2 /> : <UploadIcon />}
      >
        {isLoading ? "Parsing..." : `Upload PDF for Sheet ${token?.name}`}
      </Button>
    </div>
  );
}
