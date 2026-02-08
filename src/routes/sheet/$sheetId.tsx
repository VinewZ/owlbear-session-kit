import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { use5eSheetParser } from "@/-hooks/pdf/use5eSheetParser";
import { Sheet } from "./-components";
import { useYDoc } from "@/-hooks/yjs/useYDoc";
import { Y_CHARACTER_SHEETS } from "@/lib/constants";
import type * as Y from "yjs";
import type { SheetMap } from "@/lib/yjs/types";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const { isLoading, error, parsePdf } = use5eSheetParser();
  const ydoc = useYDoc(Y_CHARACTER_SHEETS);
  const sheets = ydoc?.getMap<Y.Map<SheetMap["character"]>>("sheets");
  const sheet = sheets?.get(sheetId) ?? null;
  const character = sheet?.get("character") ?? null;

  console.log(character);

  return (
    <Box className="relative w-screen h-[calc(100vh-45px)]">
      <Sheet.Backdrop isVisible={isLoading} />
      <Sheet.Error error={error} />
      {character ? (
        <Sheet.Character character={character} sheetId={sheetId} />
      ) : (
        <Sheet.CharactersList
          sheets={sheets}
          parsePdf={parsePdf}
          isLoading={isLoading}
          sheetId={sheetId}
        />
      )}
      <Sheet.Footer />
    </Box>
  );
}
