import { Button } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, useRef } from "react";
import { use5eSheetParser } from "./-hooks/pdf/use5eSheetParser";
import { DNS_ID } from "@/lib/helper";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { character, isLoading, error, parsePdf } = use5eSheetParser();
  console.log(character);

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

  const handleOBKClick = () => {
    console.log("Opening: ", `${DNS_ID}/sheet-popover`)
    OBR.popover.open({
      id: `${DNS_ID}/sheet-popover`,
      url: "/sheet",
      height: 500,
      width: 600,
      disableClickAway: true,
      anchorOrigin: {
        horizontal: "RIGHT",
        vertical: "BOTTOM",
      },
    });
  };

  OBR.onReady(() => {
    OBR.contextMenu.create({
      id: `${DNS_ID}/sheet-menu`,
      icons: [
        {
          icon: "/icons/sheet.svg",
          label: "Attach Sheet",
          filter: {
            every: [{ key: "layer", value: "CHARACTER" }],
          },
        },
      ],
      onClick: handleOBKClick
    });
  });

  return (
    <div className="pdf-uploader">
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

      <Button onClick={handleOBKClick}>Open modal</Button>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
