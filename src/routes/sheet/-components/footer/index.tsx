import { CloseFullscreen, OpenInFull } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import { DNS_ID } from "@/lib/helper";

export function Footer() {
  const [isMinimized, setIsMinimized] = useState(false);

  async function closeSheet() {
    await OBR.popover.close(`${DNS_ID}/sheet-popover`);
  }
  async function handleSizeSheet() {
    if (isMinimized) {
      await OBR.popover.setHeight(`${DNS_ID}/sheet-popover`, 500);
      setIsMinimized((prev) => !prev);
    } else {
      await OBR.popover.setHeight(`${DNS_ID}/sheet-popover`, 45);
      setIsMinimized((prev) => !prev);
    }
  }

  return (
    <Grid
      container
      sx={{
        height: 45,
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "2px solid #BB99FF",
        background: "#FFF"
      }}
    >
      <Button onClick={handleSizeSheet}>
        {isMinimized ? <OpenInFull /> : <CloseFullscreen />}
      </Button>
      <Button
        onClick={closeSheet}
        sx={{ background: "#BB99FF", color: "#FFF", mr: "1rem" }}
      >
        Close
      </Button>
    </Grid>
  );
}
