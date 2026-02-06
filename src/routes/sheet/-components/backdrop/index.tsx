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
    <Box
      sx={{
        position: "relative",
      }}
    >
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
        sx={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          background: "#00000080",
        }}
      ></Box>
    </Box>
  );
}
