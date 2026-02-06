import { CloseFullscreen, OpenInFull } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import { RIGHT_SHEET_POPOVER_ID } from "@/lib/constants";

export function Footer() {
  const [isMinimized, setIsMinimized] = useState(false);

  async function closeSheet() {
    await OBR.popover.close(RIGHT_SHEET_POPOVER_ID);
  }
  async function handleSizeSheet() {
    if (isMinimized) {
      await OBR.popover.setHeight(RIGHT_SHEET_POPOVER_ID, 500);
      setIsMinimized((prev) => !prev);
    } else {
      await OBR.popover.setHeight(RIGHT_SHEET_POPOVER_ID, 45);
      setIsMinimized((prev) => !prev);
    }
  }

  return (
    <Grid
      container
      className="h-11.25 items-center justify-between fixed bottom-0 left-0 right-0 border-t-2 border-[#BB99FF] bg-white"
    >
      <Button onClick={handleSizeSheet}>
        {isMinimized ? <OpenInFull /> : <CloseFullscreen />}
      </Button>
      <Button
        onClick={closeSheet}
        className="bg-[#BB99FF] text-white mr-4 hover:brightness-110 transition rounded-full px-4"
      >
        Close
      </Button>
    </Grid>
  );
}
