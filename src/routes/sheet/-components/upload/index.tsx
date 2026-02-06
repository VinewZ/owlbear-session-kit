import { Box, Button } from "@mui/material";
import { type ChangeEvent, useRef } from "react";

type UploadPropsT = {
  parsePdf: (file: File) => Promise<void>;
  isLoading: boolean;
};

export function Upload({ parsePdf, isLoading }: UploadPropsT) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      await parsePdf(file);
    }
    // Reset input to allow re-uploading the same file
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
