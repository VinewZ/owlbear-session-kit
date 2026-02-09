import { Loop } from "@mui/icons-material";
import { Box } from "@mui/material";

type BackDropPropsT = {
  showIcon?: boolean;
  isVisible?: boolean;
};

export function Backdrop({
  showIcon = true,
  isVisible = false,
}: BackDropPropsT) {
  if (!isVisible) return null;

  return (
    <Box className="relative">
      {showIcon && (
        <Box
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
          }}
        >
          <Loop
            className="animate-spin"
            sx={{ color: "white", animationDirection: "reverse", fontSize: 48 }}
          />
        </Box>
      )}
      <Box
        className="fixed w-screen h-screen bg-black/80 z-50"
      ></Box>
    </Box>
  );
}
