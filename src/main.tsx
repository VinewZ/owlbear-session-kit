import GlobalStyles from "@mui/material/GlobalStyles";
import { StyledEngineProvider } from "@mui/material/styles";
import OBR from "@owlbear-rodeo/sdk";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { setupContextMenu } from "./lib/context-menu";
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "./components/theme-provider";
import i18n from "./lib/i18n";
import reportWebVitals from "./reportWebVitals.ts";

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Register context menu once at module level (before React mounts)
if (OBR.isAvailable) {
	OBR.onReady(setupContextMenu);
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<I18nextProvider i18n={i18n}>
				<StyledEngineProvider enableCssLayer>
					<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
					<ThemeProvider>
						<RouterProvider router={router} />
					</ThemeProvider>
				</StyledEngineProvider>
			</I18nextProvider>
		</StrictMode>,
	);
}

reportWebVitals();
