import { Box, Divider } from "@mui/material";
import { Identity } from "./-components/identity";
import type { CharacterT } from "@/-hooks/pdf/parser";

type CharacterPropsT = {
  character: CharacterT | null;
  sheetId: string;
};

export function Character({ character, sheetId }: CharacterPropsT) {
  if (!character) return null;

  return (
    <>
      <Identity character={character} sheetId={sheetId} />
      <Divider className="my-3" />
      {
        // <Abilities character={character} />
        // <Divider className="my-3"/>
        // <Combat character={character} />
        // <Divider className="my-3"/>
        // <Weapons character={character} />
        // <Divider className="my-3"/>
      }
      <Box className="overflow-hidden">
        <pre>{JSON.stringify(character, null, 2)}</pre>
      </Box>
    </>
  );
}
