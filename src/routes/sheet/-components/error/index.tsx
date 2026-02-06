import { Box, Typography } from "@mui/material";
import { Backdrop } from "../backdrop";

type ErrPropsT = {
  error: string | null;
};

export function Err({ error }: ErrPropsT) {
  if (!error) return null;

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <Backdrop showIcon={false} isVisible={true} />
      <Box
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 101,
          background: "#ff000080",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <Typography variant="h6" style={{ color: "white" }}>
          Error
        </Typography>
        <Typography style={{ color: "white" }}>{error}</Typography>
      </Box>
    </Box>
  );
}
