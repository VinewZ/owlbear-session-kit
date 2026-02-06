import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { use5eSheetParser } from "../-hooks/pdf/use5eSheetParser";
import { Sheet } from "./-components";

export const Route = createFileRoute("/sheet/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { character, isLoading, error, parsePdf } = use5eSheetParser();

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "relative" }}>
        <Sheet.Backdrop isVisible={isLoading} />
        <Sheet.Error error={error} />
        <Sheet.Upload isLoading={isLoading} parsePdf={parsePdf} />
        <Sheet.Character character={character} />
      </Box>
      <Sheet.Footer />
    </Box>
  );
}
