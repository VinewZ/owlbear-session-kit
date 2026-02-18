import GlobalStyles from "@mui/material/GlobalStyles";
import { StyledEngineProvider } from "@mui/material/styles";
import OBR from "@owlbear-rodeo/sdk";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
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
						<WaitForOBR>
							<RouterProvider router={router} />
						</WaitForOBR>
					</ThemeProvider>
				</StyledEngineProvider>
			</I18nextProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// React Provider that wraps children and waits for OBR to be ready
function WaitForOBR({ children }: { children: React.ReactNode }) {
	const [isOBRReady, setIsOBRReady] = useState(false);

	useEffect(() => {
		if (!OBR.isAvailable) return;

		OBR.onReady(() => {
			setIsOBRReady(true);
		});
	}, []);

	if (!isOBRReady) {
		return <div>Waiting For OBR...</div>;
	}

	return <>{children}</>;
}
