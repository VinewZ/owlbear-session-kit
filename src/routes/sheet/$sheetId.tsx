import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/footer";
import { Upload } from "@/components/upload";
import { EX_JSON, MAIN_BROADCAST_CHANNEL } from "@/lib/constants";
import { InteractiveSheet } from "./-components/interactive-sheet";
import { useEffect, useRef, useState } from "react";
import { useSheetDoc } from "@/hooks/yjs/use-sheet-doc";
import type { CharacterT } from "@/hooks/pdf/parser";
import { useYDocFullSync } from "@/hooks/yjs/use-y-doc-full-sync";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const ref = useRef<HTMLTextAreaElement>(null);
  const docId = `sheet-${sheetId}`
  const ydoc = useSheetDoc({
    docId,
    broadcastChannel: MAIN_BROADCAST_CHANNEL,
  });
  const [sheetSize, setSheetSize] = useState(0);

  useYDocFullSync({ydoc, docId, broadcastChannel: MAIN_BROADCAST_CHANNEL})
  const ySheet = ydoc.getMap<CharacterT>(`sheet-${sheetId}`);

  useEffect(() => {
    ydoc.on("update", () => {
      console.log("DOC", ydoc.toJSON())
    })
    const handler = () => {

      setSheetSize(ySheet.size);
    };

    ySheet.observe(handler);

    return () => ySheet.unobserve(handler);
  }, [ySheet]);

  return (
    <Box className="mb-13">
      {sheetSize > 0 ? (
        <InteractiveSheet
          character={EX_JSON}
          ySheet={ySheet}
          sheetId={sheetId}
        />
      ) : (
        <Upload sheetId={sheetId} ydoc={ydoc} />
      )}
      <textarea
        ref={ref}
        className="w-full h-full border p-2 disabled:cursor-not-allowed disabled:bg-gray-100"
        placeholder={`Editing sheet: ${sheetId}`}
      />

      <Footer />
    </Box>
  );
}
