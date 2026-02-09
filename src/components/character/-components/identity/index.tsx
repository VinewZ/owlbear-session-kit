import * as Y from "yjs";
import { Box, Divider, Typography } from "@mui/material";
import OBR, { isImage } from "@owlbear-rodeo/sdk";
import { useEffect, useState, useCallback } from "react"; // Add useCallback
import { logger } from "@/lib/utils";
import type { SheetMap } from "@/lib/yjs/types";

type IdentityPropsT = {
  character: SheetMap["character"] | null;
  sheetId: string;
};

export function Identity({ character, sheetId }: IdentityPropsT) {
  const [portrait, setPortrait] = useState<string | null>(null);

  const fetchPortrait = useCallback(async () => {
    // Wrap in useCallback
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
  }, [sheetId]); // Remove setPortrait from dependencies

  useEffect(() => {
    fetchPortrait();
  }, [fetchPortrait]);

  if (!character) return null;

  return (
    <Box className="flex items-center px-2 gap-6">
      <Box className="flex gap-2 items-center justify-center mb-2">
        <Typography
          className="text-nowrap text-center"
          variant="h1"
          fontWeight="bold"
          fontSize={32}
        >
          {((character.get("identity") as Y.Map<string | number>)?.get("name") as string || '')}

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
              {((character.get("identity") as Y.Map<string | number>)?.get("class") as string || '')}
            </Typography>
            <sub>Class</sub>
          </Box>
          <Divider />
          <Box>
            <Typography className="text-nowrap">
              {((character.get("identity") as Y.Map<string | number>)?.get("species") as string || '')}
            </Typography>
            <sub>Race</sub>
          </Box>
        </Box>
        <Box className="flex flex-col justify-center">
          <Box>
            <Typography className="text-nowrap">
              {((character.get("identity") as Y.Map<string | number>)?.get("level") as number || 0)}
            </Typography>
            <sub>Level</sub>
          </Box>
          <Divider />
          <Box>
            <Typography className="text-nowrap">
              {((character.get("identity") as Y.Map<string | number>)?.get("alignment") as string || '')}
            </Typography>
            <sub>Alignment</sub>
          </Box>
        </Box>
        <Box className="flex flex-col justify-center">
          <Box>
            <Typography className="text-nowrap">
              {((character.get("identity") as Y.Map<string | number>)?.get("experience") as number || 0)}
            </Typography>
            <sub>Experience</sub>
          </Box>
          <Divider />
          <Box>
            <Typography className="text-nowrap">
              {((character.get("identity") as Y.Map<string | number>)?.get("background") as string || '')}
            </Typography>
            <sub>Background</sub>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
