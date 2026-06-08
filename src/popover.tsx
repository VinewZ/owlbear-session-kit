import CssBaseline from "@mui/material/CssBaseline";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { GlobalStyles } from "./components/dice-tray/GlobalStyles";
import { PopoverTrays } from "./components/dice-tray/plugin/PopoverTrays";
import { ThemeProvider } from "./components/theme-provider";

function PluginGate({ children }: { children: React.ReactNode }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (OBR.isAvailable) {
			OBR.onReady(() => setReady(true));
		}
	}, []);

	if (ready) {
		return <>{children}</>;
	} else {
		return null;
	}
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<ThemeProvider>
		<CssBaseline />
		<GlobalStyles />
		<PluginGate>
			<PopoverTrays />
		</PluginGate>
	</ThemeProvider>,
);
