import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Upload } from "@/components/upload";
import { use5eSheetParser } from "@/hooks/pdf/use-5e-sheet-parser";
import { useYDoc } from "@/hooks/yjs/use-y-doc";
import { useYDocFullSync } from "@/hooks/yjs/use-y-doc-full-sync";
import { MAIN_BROADCAST_CHANNEL, EX_JSON } from "@/lib/constants";
import { InteractiveSheet } from "./-components/interactive-sheet";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const ref = useRef<HTMLTextAreaElement>(null);
  const yjsDocName = `sheet-${sheetId}`;
  const broadcastChannel = MAIN_BROADCAST_CHANNEL;
  const { character, isLoading, parsePdf } = use5eSheetParser();

  // This hook Syncs users in the same session editing the same sheet
  const yDoc = useYDoc({ ref, yjsDocName, broadcastChannel });

  // This hook Syncs new users who joined late with the current state of the sheet
  const { isSynced } = useYDocFullSync({
    ydoc: yDoc,
    docId: yjsDocName,
    broadcastChannel: MAIN_BROADCAST_CHANNEL,
  });

  return (
    <div>
      {EX_JSON ? (
        <InteractiveSheet character={EX_JSON} />
      ) : (
        <Upload isLoading={isLoading} parsePdf={parsePdf} sheetId={sheetId} />
      )}
      {
        // <textarea
        //   ref={ref}
        //   className="w-full h-full border p-2 disabled:cursor-not-allowed disabled:bg-gray-100"
        //   placeholder={`Editing sheet: ${sheetId}`}
        //   disabled={!isSynced}
        // />
      }
    </div>
  );
}
