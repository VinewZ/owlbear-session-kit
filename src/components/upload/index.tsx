import { Button } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { Loader2, Upload as UploadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CharacterT } from "@/hooks/pdf/parser";

interface UploadProps {
  isLoading: boolean;
  parsePdf: (file: File) => Promise<CharacterT | null>;
  sheetId: string;
}

async function getName(sheetId: string): Promise<string> {
  const items = await OBR.scene.items.getItems([sheetId]);
  if (items.length !== 1) {
    return "";
  }

  return items[0].name;
}

export function Upload({ isLoading, parsePdf, sheetId }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    getName(sheetId).then((res) => {
      setName(res);
    });
  }, [sheetId]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear the input so the same file can be selected again
    event.target.value = "";

    // Validate it's a PDF
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    try {
      await parsePdf(file);
    } catch (err) {
      console.error("Error parsing PDF:", err);
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
        {isLoading ? "Parsing..." : `Upload PDF for Sheet ${name}`}
      </Button>
    </div>
  );
}
