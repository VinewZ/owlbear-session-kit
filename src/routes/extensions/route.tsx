import {
	Alert,
	AlertTitle,
	Box,
	CircularProgress,
	Typography,
} from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/extensions")({
	component: ExtensionsLayout,
});

type Status = "loading" | "ready" | "unavailable";

function ExtensionsLayout() {
	const [status, setStatus] = useState<Status>("loading");

	useEffect(() => {
		if (!OBR.isAvailable) {
			setStatus("unavailable");
			return;
		}

		if (OBR.isReady) {
			setStatus("ready");
		} else {
			OBR.onReady(() => setStatus("ready"));
		}
	}, []);

	if (status === "unavailable") {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					p: 3,
				}}
			>
				<Alert severity="error" sx={{ maxWidth: 500 }}>
					<AlertTitle>Owlbear Rodeo Required</AlertTitle>
					<Typography variant="body2">
						This extension requires Owlbear Rodeo to run. Please open it from
						within an Owlbear Rodeo room.
					</Typography>
				</Alert>
			</Box>
		);
	}

	if (status === "loading") {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<CircularProgress />
				<Typography variant="body2" color="text.secondary">
					Connecting to Owlbear Rodeo...
				</Typography>
			</Box>
		);
	}

	return <Outlet />;
}
