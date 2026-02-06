import { Box, Grid, Typography } from "@mui/material";
import type { CharacterT } from "@/-hooks/pdf/parser";

export function Abilities({ character }: { character: CharacterT }) {
  return (
    <Grid container columns={6}>
      {Object.entries(character.abilities).map(([ability, { score, mod }]) => (
        <Grid key={ability} size={1}>
          <Box className="flex gap-1 items-center flex-col">
            <Typography>{score}</Typography>
            <Typography className="text-xs">
              {mod && mod >= 0 ? `+${mod}` : mod}
            </Typography>
            <Typography className="bg-black text-white rounded px-4 py-0.5 text-sm font-bold">
              {ability}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
