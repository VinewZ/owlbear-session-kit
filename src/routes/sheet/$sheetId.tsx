import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type * as Y from "yjs";
import { Footer } from "@/components/footer";
import { Upload } from "@/components/upload";
import { useYState } from "@/lib/yjs/hooks/use-y-state";
import { useYDoc } from "@/lib/yjs/hooks/use-ydoc";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const ydoc = useYDoc();
  const sheets = ydoc.getMap<Y.Map<any>>("sheets");
  const [text, setText] = useYState(sheets, "text", "");
  const [sheet, setSheet] = useState();

  useEffect(() => {
    const observer = () => {
      const currentSheet = sheets.get(sheetId);
      setSheet(currentSheet);
    };

    sheets.observe(observer);

    return () => {
      sheets.unobserve(observer);
    };
  }, [sheets, sheetId]);

  return (
    <Box>
      <div>ID</div>
      <div>{sheetId}</div>
      <input value={text} onChange={(e) => setText(e.currentTarget.value)} />

      <Upload sheetId={sheetId} ydoc={ydoc} />
      <pre>{JSON.stringify(sheet?.toJSON(), null, 2)}</pre>
      <Footer />
    </Box>
  );
}
