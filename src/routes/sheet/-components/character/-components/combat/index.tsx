import { Box, Grid, Typography } from "@mui/material";
import type { CharacterT } from "@/-hooks/pdf/parser";

export function Combat({ character }: { character: CharacterT }) {
  return (
    <Grid container columns={3} spacing={2}>
      <Grid size={1}>
        <Box className="flex gap-1 items-center flex-col">
          <Typography>{character.combat.initiative}</Typography>
          <Typography className="bg-black text-white rounded px-4 py-0.5 text-sm font-bold">
            Initiative
          </Typography>
        </Box>
      </Grid>
      <Grid size={1}>
        <Box className="flex gap-1 items-center flex-col">
          <Typography>{character.combat.proficiencyBonus}</Typography>
          <Typography className="bg-black text-white rounded px-4 py-0.5 text-sm font-bold">
            Proficiência
          </Typography>
        </Box>
      </Grid>
      <Grid size={1}>
        <Box className="flex gap-1 items-center flex-col">
          <Typography>{character.combat.speed}</Typography>
          <Typography className="bg-black text-white rounded px-4 py-0.5 text-sm font-bold">
            Movimento
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
