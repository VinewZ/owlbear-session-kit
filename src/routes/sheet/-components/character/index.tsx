import { Box } from "@mui/material";
import type { CharacterT } from "@/routes/-hooks/pdf/parser";

type CharacterPropsT = {
  character: CharacterT | null;
};

export function Character({ character }: CharacterPropsT) {
  return (
    <Box>
      <pre>{JSON.stringify(character, null, 2)}</pre>
    </Box>
  );
}
