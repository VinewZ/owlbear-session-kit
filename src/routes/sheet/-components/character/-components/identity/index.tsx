import { Box, Divider, Typography } from "@mui/material";
import OBR, { isImage } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import type { CharacterT } from "@/-hooks/pdf/parser";
import { logger } from "@/lib/utils";

type IdentityPropsT = {
  character: CharacterT;
  sheetId: string;
};

export function Identity({ character, sheetId }: IdentityPropsT) {
  const [portrait, setPortrait] = useState<string | null>(null);

  useEffect(() => {
    async () => {
      try {
        const items = await OBR.scene.items.getItems(isImage);
        const item = items?.find((item) => item.id === sheetId);
        if (item) {
          setPortrait(item.image.url);
        } else {
          logger.warn("No item found with ID:", sheetId);
        }
      } catch (error) {
        logger.error("Error fetching item:", error);
      }
    };
  }, [sheetId]);

  return (
    <Box className="flex items-center px-2 gap-6">
      <Box className="flex gap-2 items-center justify-center mb-2">
        <Typography
          className="text-nowrap text-center"
          variant="h1"
          fontWeight="bold"
          fontSize={32}
        >
          {character.identity.name}

          {portrait && (
            <img
              src={portrait}
              alt="Portrait"
              className="w-28 h-28 object-cover rounded"
            />
          )}
        </Typography>
      </Box>
      <Box className="flex gap-2 items-center justify-center">
        <Box className="flex flex-col justify-center">
          <Box>
            <Typography className="text-nowrap">
              {character.identity.class}
            </Typography>
            <sub>Class</sub>
          </Box>
          <Divider />
          <Box>
            <Typography className="text-nowrap">
              {character.identity.species}
            </Typography>
            <sub>Race</sub>
          </Box>
        </Box>
        <Box className="flex flex-col justify-center">
          <Box>
            <Typography className="text-nowrap">
              {character.identity.level}
            </Typography>
            <sub>Level</sub>
          </Box>
          <Divider />
          <Box>
            <Typography className="text-nowrap">
              {character.identity.alignment}
            </Typography>
            <sub>Alignment</sub>
          </Box>
        </Box>
        <Box className="flex flex-col justify-center">
          <Box>
            <Typography className="text-nowrap">
              {character.identity.experience}
            </Typography>
            <sub>Experience</sub>
          </Box>
          <Divider />
          <Box>
            <Typography className="text-nowrap">
              {character.identity.background}
            </Typography>
            <sub>Background</sub>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
