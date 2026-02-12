import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type * as Y from "yjs";
import { Footer } from "@/components/footer";
import { useYState } from "@/lib/yjs/hooks/use-y-state";
// import { Upload } from "@/components/upload";
import { useYDoc } from "@/lib/yjs/hooks/use-ydoc";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const ydoc = useYDoc();
  const sheets = ydoc.getMap<Y.Map<unknown>>("sheets");
  const [_, setSheet] = useState<Y.Map<unknown> | undefined>();
  const [text, setText] = useYState(sheets, "text", "");

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

  useEffect(() => {
    window.postMessage(text, "*");
  }, [text]);

  console.log(window.origin)

  return (
    <Box>
      <div>ID</div>
      <div>{sheetId}</div>
      <input value={text} onChange={(e) => setText(e.currentTarget.value)} />
      <div>
        <p>sheet text:</p>
        {text}
      </div>
      <Footer />
    </Box>
  );
}
