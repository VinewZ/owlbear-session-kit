import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { use5eSheetParser } from "@/-hooks/pdf/use5eSheetParser";
import { Sheet } from "./-components";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const { character, isLoading, error, parsePdf } = use5eSheetParser();


  return (
    <Box className="relative w-screen h-[calc(100vh-45px)]">
      <Sheet.Backdrop isVisible={isLoading} />
      <Sheet.Error error={error} />
      {!character && <Sheet.Upload isLoading={isLoading} parsePdf={parsePdf} />}
      <Sheet.Character character={character} sheetId={sheetId} />
      <Sheet.Footer />
    </Box>
  );
}
