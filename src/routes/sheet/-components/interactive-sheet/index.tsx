import {
  Box,
  Checkbox,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { NumberField } from "@/components/ui/number-field";
import { useToken } from "@/hooks/obr/use-token";
import type { CharacterT } from "@/hooks/pdf/parser";
import { CharacterPortrait } from "./character-portrait";
import { SKILL_TO_ABILITY } from "@/lib/constants";

type InteractiveSheetPropsT = {
  ySheet: unknown;
  character: CharacterT;
  sheetId: string;
};

export function InteractiveSheet({
  character,
  ySheet,
  sheetId,
}: InteractiveSheetPropsT) {
  const { token, loading } = useToken(sheetId);

  return (
    <Box>
      <Grid
        container
        columns={3}
        columnSpacing={5}
        className="p-2 justify-between items-center"
      >
        <Grid>
          <Typography className="text-center font-bold text-3xl">
            {character.identity.name}
          </Typography>
        </Grid>
        <Grid container columns={3} spacing={2} className="items-center">
          <Box>
            <Typography>{character.identity.class}</Typography>
            <sub>Class</sub>
            <Divider />
            <Typography>{character.identity.species}</Typography>
            <sub>Race</sub>
          </Box>
          <Box>
            <Typography>{character.identity.level}</Typography>
            <sub>Level</sub>
            <Divider />
            <Typography>{character.identity.alignment}</Typography>
            <sub>alignment</sub>
          </Box>
          <Box>
            <Typography>{character.identity.experience}</Typography>
            <sub>XP</sub>
            <Divider />
            <Typography>{character.identity.background}</Typography>
            <sub>Background</sub>
          </Box>
        </Grid>
        <Grid>
          {token && (
            <CharacterPortrait isLoading={loading} url={token?.image.url} />
          )}
        </Grid>
      </Grid>
      <Divider className="my-5" />
      <Box className="flex gap-8 items-center">
        <Box>
          <Box className="flex flex-col w-24 px-2">
            <NumberField label="Proficiency" labelOn="TOP" />
          </Box>
          <Box className="flex flex-col w-24 px-2">
            <NumberField label="Inspiration" labelOn="BOTTOM" />
          </Box>
        </Box>
        <Box className="flex flex-col gap-4">
          <Box className="flex items-center gap-2 justify-center">
            <Box className="text-center mr-auto">
              <sup>Death Saves</sup>
              <Box className="flex flex-col gap-1">
                <Box className="flex justify-center items-center gap-1">
                  <Checkbox className="size-1 " />
                  <Checkbox className="size-1" />
                  <Checkbox className="size-1" />
                </Box>
                <Box className="flex justify-center items-center gap-1">
                  <Checkbox className="size-1 " />
                  <Checkbox className="size-1" />
                  <Checkbox className="size-1" />
                </Box>
              </Box>
            </Box>
            <Box className="text-center">
              <sup>Max HP</sup>
              <Typography className="text-3xl font-bold">
                {character.combat.maxHP}
              </Typography>
            </Box>
            <Box className="text-center">
              <sup>Current HP</sup>
              <Typography className="text-3xl font-bold">
                {character.combat.currentHP}
              </Typography>
            </Box>
            <Box className="text-center">
              <sup>Temp HP</sup>
              <Typography className="text-3xl font-bold">
                {character.combat.tempHP}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box className="flex items-center gap-4">
            <Box className="text-center">
              <Typography className="font-bold text-2xl">
                {character.identity.passivePerception}
              </Typography>
              <Typography className="text-xs">Passive Perception</Typography>
            </Box>
            <Box className="text-center">
              <Typography className="font-bold text-2xl">
                {character.combat.armorClass}
              </Typography>
              <Typography className="text-xs">Armor Class</Typography>
            </Box>
            <Box className="text-center">
              <Typography className="font-bold text-2xl">
                {character.combat.initiative}
              </Typography>
              <Typography className="text-xs">Initiative</Typography>
            </Box>
            <Box className="text-center">
              <Typography className="font-bold text-2xl">
                {character.combat.speed}
              </Typography>
              <Typography className="text-xs">Speed</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider className="my-5" />
      <Box className="flex justify-between gap-2">
        <Box className="gap-2 flex min-w-68 max-w-68 w-68 flex-wrap justify-center">
          {Object.entries(character.abilities).map(([ability, data]) => (
            <Grid key={ability} className="border w-32 px-1">
              <Box className="text-center">
                <Typography className="font-bold">{ability}</Typography>
                <Typography>{data.score}</Typography>
                {data.mod && (
                  <Typography>
                    {data.mod >= 0 ? "+" : ""}
                    {data.mod}
                  </Typography>
                )}
                <Box className="flex justify-center gap-1">
                  <Typography className="text-xs">Save:</Typography>
                  <Typography className="text-xs">
                    {data.save && data.save >= 0 ? "+" : ""}
                    {data.save ?? 0}
                  </Typography>
                </Box>
              </Box>

              <Box mt={1}>
                {skillsByAbility[ability]?.map((skill) => (
                  <Box
                    key={skill}
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Typography className="text-sm capitalize">
                      {skill.replaceAll("_", " ").toLocaleLowerCase()}
                    </Typography>
                    <Typography variant="body2">
                      {character.skills[skill] >= 0 ? "+" : ""}
                      {character.skills[skill] ?? data.mod}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Box>
        <Box className="flex flex-col justify-between">
          <Box>
            <Typography className="text-2xl font-bold">Feats</Typography>
            {character.identity.feats.split(/\r?\n/).map((line) => (
              <Box key={line}>
                <Typography>{line}</Typography>
                <Divider className="my-1" />
              </Box>
            ))}
          </Box>
          <Box>
            <Typography className="text-2xl font-bold">Traits</Typography>
            {character.identity.traits.split(/\r?\n/).map((line) => (
              <Box key={line}>
                <Typography>{line}</Typography>
                <Divider className="my-1" />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Divider className="my-5" />
      <Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Bonus</TableCell>
                <TableCell>Damage</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {character.weapons.map((weapon) => (
                <TableRow
                  key={weapon.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{weapon.name}</TableCell>
                  <TableCell>{weapon.bonus}</TableCell>
                  <TableCell>{weapon.damage}</TableCell>
                  <TableCell>{weapon.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

const skillsByAbility = Object.entries(SKILL_TO_ABILITY).reduce(
  (acc, [skill, ability]) => {
    if (!acc[ability]) acc[ability] = [];
    acc[ability].push(skill);
    return acc;
  },
  {} as Record<string, string[]>,
);
