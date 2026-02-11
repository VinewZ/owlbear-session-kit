import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useYState } from "@/lib/yjs/hooks/use-y-state";
import { useYDoc } from "@/lib/yjs/hooks/use-ydoc";
import { useEffect, useState } from "react";
import { Upload } from "@/components/upload";
import type { CharacterT } from "@/hooks/pdf/parser";

export const Route = createFileRoute("/sheet/$sheetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sheetId } = Route.useParams();
  const ydoc = useYDoc();
  const sheets = ydoc.getMap<CharacterT>("sheets");
  const [character, setCharacter] = useState();
  const [text, setText] = useYState(sheets, "text", "");

  useEffect(() => {
    console.log(JSON.stringify(ydoc.toJSON(), null, 2));
  }, [text]);

  return (
    <Box>
      <div>ID</div>
      <div>{sheetId}</div>

      <input value={text} onChange={(e) => setText(e.currentTarget.value)} />

      <Upload
        sheetId={sheetId}
        sheetsMap={sheets}
        setCharacter={setCharacter}
      />
      <pre>{JSON.stringify(character, null, 2)}</pre>
    </Box>
  );
}
